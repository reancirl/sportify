<?php

namespace App\Http\Controllers\Public;

use App\Enums\PaymentStatus;
use App\Enums\VenueStatus;
use App\Exceptions\Domain\SlotUnavailableException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\StoreGuestCheckoutRequest;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Payment;
use App\Services\Booking\BookingService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly BookingService $bookings) {}

    public function show(Request $request): Response
    {
        $courtId = $request->string('court')->toString();
        $startsAtParam = $request->string('starts_at')->toString();
        $slotCount = max(1, min(12, (int) $request->integer('slot_count', 1)));

        abort_if($courtId === '' || $startsAtParam === '', 404);

        $court = Court::query()
            ->active()
            ->whereHas('venue', fn ($q) => $q->where('status', VenueStatus::Approved))
            ->with('venue')
            ->find($courtId);

        abort_if($court === null, 404);

        $venue = $court->venue;
        $tz = $venue->timezone ?: 'Asia/Manila';

        try {
            $startsAt = CarbonImmutable::parse($startsAtParam);
        } catch (\Throwable) {
            abort(422, 'Invalid start time.');
        }

        $slotMinutes = (int) ($court->slot_minutes ?: 60);
        $totalMinutes = $slotMinutes * $slotCount;
        $endsAt = $startsAt->copy()->addMinutes($totalMinutes);
        $hours = $totalMinutes / 60;
        $totalAmount = round((float) $court->hourly_rate * $hours, 2);

        return Inertia::render('public/checkout', [
            'venue' => [
                'id' => $venue->id,
                'name' => $venue->name,
                'slug' => $venue->slug,
                'city' => $venue->city,
                'province' => $venue->province,
                'timezone' => $tz,
                'contact_email' => $venue->contact_email,
                'contact_phone' => $venue->contact_phone,
                'payment_methods' => $venue->paymentMethods()
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'provider' => $m->provider->value,
                        'provider_label' => $m->provider->label(),
                        'account_name' => $m->account_name,
                        'mobile_number' => $m->mobile_number,
                    ])
                    ->values(),
            ],
            'court' => [
                'id' => $court->id,
                'name' => $court->name,
                'surface_type' => $court->surface_type?->value,
                'hourly_rate' => (string) $court->hourly_rate,
                'slot_minutes' => $slotMinutes,
            ],
            'reservation' => [
                'starts_at' => $startsAt->setTimezone($tz)->toIso8601String(),
                'ends_at' => $endsAt->setTimezone($tz)->toIso8601String(),
                'slot_count' => $slotCount,
                'hours' => $hours,
                'total_amount' => $totalAmount,
            ],
        ]);
    }

    public function store(StoreGuestCheckoutRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $court = Court::query()
            ->active()
            ->whereHas('venue', fn ($q) => $q->where('status', VenueStatus::Approved))
            ->findOrFail($data['court_id']);

        try {
            $booking = $this->bookings->createBooking(
                user: null,
                court: $court,
                startsAt: Carbon::parse($data['starts_at']),
                slotCount: (int) ($data['slot_count'] ?? 1),
                guest: [
                    'name' => $data['guest_name'],
                    'email' => $data['guest_email'],
                    'phone' => $data['guest_phone'],
                ],
            );
        } catch (SlotUnavailableException) {
            return back()->withErrors([
                'starts_at' => 'One or more slots in this booking are no longer available. Please pick another time.',
            ])->withInput();
        }

        if ($notes = $data['notes'] ?? null) {
            $booking->forceFill(['notes' => $notes])->save();
        }

        // Store the uploaded payment proof on the public disk and create a
        // pending Payment record tied to this booking.
        $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');

        Payment::query()->create([
            'payable_type' => Booking::class,
            'payable_id' => $booking->id,
            'user_id' => null,
            'amount' => $booking->total_amount,
            'proof_image_path' => $proofPath,
            'reference_number' => $data['reference_number'] ?? null,
            'status' => PaymentStatus::Pending,
        ]);

        return redirect()
            ->route('checkout.success', ['booking' => $booking->id])
            ->with('success', 'Booking submitted. The venue will verify your payment shortly.');
    }

    public function success(Booking $booking): Response
    {
        $booking->load(['court.venue', 'payment']);

        return Inertia::render('public/checkout-success', [
            'booking' => [
                'id' => $booking->id,
                'starts_at' => $booking->starts_at?->toIso8601String(),
                'ends_at' => $booking->ends_at?->toIso8601String(),
                'total_amount' => (string) $booking->total_amount,
                'status' => $booking->status->value,
                'guest_name' => $booking->guest_name,
                'guest_email' => $booking->guest_email,
                'guest_phone' => $booking->guest_phone,
                'court' => $booking->court ? [
                    'id' => $booking->court->id,
                    'name' => $booking->court->name,
                ] : null,
                'venue' => $booking->court?->venue ? [
                    'id' => $booking->court->venue->id,
                    'name' => $booking->court->venue->name,
                    'slug' => $booking->court->venue->slug,
                    'city' => $booking->court->venue->city,
                    'contact_email' => $booking->court->venue->contact_email,
                    'contact_phone' => $booking->court->venue->contact_phone,
                ] : null,
                'payment' => $booking->payment ? [
                    'id' => $booking->payment->id,
                    'status' => $booking->payment->status->value,
                    'reference_number' => $booking->payment->reference_number,
                ] : null,
            ],
        ]);
    }
}
