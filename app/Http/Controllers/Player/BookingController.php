<?php

namespace App\Http\Controllers\Player;

use App\Enums\VenueStatus;
use App\Exceptions\Domain\BookingCancellationWindowClosedException;
use App\Exceptions\Domain\SlotUnavailableException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Venue;
use App\Services\Booking\BookingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookings) {}

    public function index(Request $request): Response
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['court.venue', 'payment'])
            ->orderByDesc('starts_at')
            ->paginate(20);

        return Inertia::render('player/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(Request $request): Response
    {
        $venueId = $request->string('venue')->toString();
        $courtId = $request->string('court')->toString();
        $date = $request->string('date')->toString();
        $startsAtParam = $request->string('starts_at')->toString();
        $slotCountParam = (int) $request->integer('slot_count', 1);
        $slotCountParam = max(1, min(12, $slotCountParam));

        $venues = Venue::query()
            ->approved()
            ->with(['courts' => fn ($q) => $q->active()])
            ->orderBy('name')
            ->get(['id', 'name', 'city', 'province', 'timezone']);

        $slots = [];
        $selectedCourt = null;
        $resolvedStartsAt = null;

        if ($courtId !== '') {
            $selectedCourt = Court::query()
                ->active()
                ->whereHas('venue', fn ($q) => $q->where('status', VenueStatus::Approved))
                ->with('venue')
                ->find($courtId);

            if ($selectedCourt) {
                // Derive the date from starts_at if the caller passed one
                // (e.g. coming from the public schedule deep-link).
                if ($startsAtParam !== '' && $date === '') {
                    try {
                        $tz = $selectedCourt->venue->timezone ?? config('app.timezone');
                        $date = Carbon::parse($startsAtParam)->setTimezone($tz)->toDateString();
                    } catch (\Throwable) {
                        // ignore — fall through to default date
                    }
                }

                $targetDate = $date !== ''
                    ? Carbon::parse($date)
                    : Carbon::today(config('app.timezone'));

                $slots = collect($this->bookings->availableSlots($selectedCourt, $targetDate))
                    ->filter(fn (array $slot) => $slot['available'])
                    ->map(fn (array $slot) => $slot['starts_at']->toIso8601String())
                    ->values()
                    ->all();

                if ($startsAtParam !== '') {
                    try {
                        $resolvedStartsAt = Carbon::parse($startsAtParam)
                            ->setTimezone('UTC')
                            ->toIso8601String();
                    } catch (\Throwable) {
                        $resolvedStartsAt = null;
                    }
                }
            }
        }

        return Inertia::render('player/bookings/create', [
            'venues' => $venues,
            'selected' => [
                'venue_id' => $venueId ?: null,
                'court_id' => $courtId ?: null,
                'date' => $date ?: null,
                'starts_at' => $resolvedStartsAt,
                'slot_count' => $slotCountParam,
            ],
            'court' => $selectedCourt,
            'slots' => $slots,
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $court = Court::query()
            ->active()
            ->whereHas('venue', fn ($q) => $q->where('status', VenueStatus::Approved))
            ->findOrFail($data['court_id']);

        try {
            $booking = $this->bookings->createBooking(
                $request->user(),
                $court,
                Carbon::parse($data['starts_at']),
                (int) ($data['slot_count'] ?? 1),
            );
        } catch (SlotUnavailableException) {
            return back()->withErrors([
                'starts_at' => 'One or more slots in this booking are no longer available.',
            ])->withInput();
        }

        if ($notes = $data['notes'] ?? null) {
            $booking->forceFill(['notes' => $notes])->save();
        }

        return redirect()
            ->route('player.bookings.show', $booking)
            ->with('success', 'Booking created. Please upload payment proof.');
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load(['court.venue', 'user', 'payment']);

        return Inertia::render('player/bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function destroy(CancelBookingRequest $request, Booking $booking): RedirectResponse
    {
        $reason = $request->validated()['cancellation_reason'] ?? null;

        try {
            $this->bookings->cancelBooking($request->user(), $booking, $reason);
        } catch (BookingCancellationWindowClosedException) {
            return back()->withErrors([
                'cancellation' => 'Bookings cannot be cancelled within 24 hours of the start time.',
            ]);
        }

        return redirect()
            ->route('player.bookings.index')
            ->with('success', 'Booking cancelled.');
    }
}
