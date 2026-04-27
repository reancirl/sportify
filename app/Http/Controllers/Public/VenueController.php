<?php

namespace App\Http\Controllers\Public;

use App\Enums\VenueStatus;
use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Venue;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class VenueController extends Controller
{
    public function __construct(private readonly BookingService $bookings) {}

    public function landing(Request $request): Response
    {
        $payload = $this->indexPayload($request);

        return Inertia::render('public/landing', [
            ...$payload,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('public/venue-index', $this->indexPayload($request));
    }

    /**
     * MVP launch city — Iligan only. When we expand, replace this with the
     * approved-venues distinct list again.
     */
    private const SUPPORTED_CITIES = ['Iligan City'];

    /**
     * How many days ahead the public schedule shows on the venue page.
     */
    private const SCHEDULE_DAYS_AHEAD = 7;

    /**
     * @return array<string, mixed>
     */
    private function indexPayload(Request $request): array
    {
        $city = $request->string('city')->toString();
        $search = $request->string('search')->toString();

        $venues = Venue::query()
            ->approved()
            ->whereIn('city', self::SUPPORTED_CITIES)
            ->when($city !== '', fn ($q) => $q->inCity($city))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('province', 'like', "%{$search}%")
                        ->orWhere('address_line', 'like', "%{$search}%");
                });
            })
            ->withCount(['courts' => fn ($q) => $q->where('is_active', true)])
            ->withMin(['courts' => fn ($q) => $q->where('is_active', true)], 'hourly_rate')
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return [
            'venues' => $venues,
            'cities' => self::SUPPORTED_CITIES,
            'filters' => [
                'city' => $city ?: null,
                'search' => $search ?: null,
            ],
        ];
    }

    public function show(Request $request, Venue $venue): Response
    {
        abort_if($venue->status !== VenueStatus::Approved, 404);

        $venue->load([
            'courts' => fn ($q) => $q->active()->orderBy('name'),
            'images' => fn ($q) => $q->orderBy('sort_order'),
            'operatingHours' => fn ($q) => $q->orderBy('day_of_week'),
        ]);

        $upcomingSessions = $venue->sessions()
            ->upcoming()
            ->orderBy('starts_at')
            ->limit(5)
            ->withCount('players')
            ->get();

        [$selectedDate, $dateOptions, $earliestDate, $latestDate] =
            $this->resolveScheduleDate($request, $venue);
        $schedule = $this->buildSchedule($venue, $selectedDate);

        return Inertia::render('public/venue-show', [
            'venue' => $venue,
            'upcomingSessions' => $upcomingSessions,
            'schedule' => $schedule,
            'selectedDate' => $selectedDate->toDateString(),
            'dateOptions' => $dateOptions,
            'earliestDate' => $earliestDate->toDateString(),
            'latestDate' => $latestDate->toDateString(),
        ]);
    }

    /**
     * Resolve the selected date (in venue timezone) plus the next-7-days
     * quick-picker options. The selectable range goes from today out to the
     * venue's advance booking window (defaults to 4 weeks).
     *
     * @return array{
     *     0: CarbonImmutable,
     *     1: list<array{date: string, day_label: string, weekday: string}>,
     *     2: CarbonImmutable,
     *     3: CarbonImmutable,
     * }
     */
    private function resolveScheduleDate(Request $request, Venue $venue): array
    {
        $tz = $venue->timezone ?: 'Asia/Manila';
        $today = CarbonImmutable::now($tz)->startOfDay();

        $bookingWeeks = max(1, (int) ($venue->advance_booking_weeks ?: 4));
        $latest = $today->addWeeks($bookingWeeks)->subDay();

        $requested = $request->string('date')->toString();
        $selected = $today;

        if ($requested !== '') {
            try {
                $candidate = CarbonImmutable::parse($requested, $tz)->startOfDay();

                if ($candidate->betweenIncluded($today, $latest)) {
                    $selected = $candidate;
                }
            } catch (\Throwable) {
                // Ignore unparseable input — fall back to today.
            }
        }

        $options = [];

        for ($i = 0; $i < self::SCHEDULE_DAYS_AHEAD; $i++) {
            $day = $today->addDays($i);

            if ($day->greaterThan($latest)) {
                break;
            }

            $options[] = [
                'date' => $day->toDateString(),
                'day_label' => $i === 0
                    ? 'Today'
                    : ($i === 1 ? 'Tomorrow' : $day->format('M j')),
                'weekday' => $day->format('D'),
            ];
        }

        return [$selected, $options, $today, $latest];
    }

    /**
     * @return list<array{
     *     court: array{id: string, name: string, surface_type: ?string, hourly_rate: string, slot_minutes: int},
     *     slots: list<array{starts_at: string, ends_at: string, label: string, available: bool}>,
     * }>
     */
    private function buildSchedule(Venue $venue, CarbonImmutable $date): array
    {
        $tz = $venue->timezone ?: 'Asia/Manila';

        return $venue->courts->map(function (Court $court) use ($date, $tz) {
            $slots = $this->bookings->availableSlots($court, $date);

            return [
                'court' => [
                    'id' => $court->id,
                    'name' => $court->name,
                    'surface_type' => $court->surface_type?->value,
                    'hourly_rate' => (string) $court->hourly_rate,
                    'slot_minutes' => (int) $court->slot_minutes,
                ],
                'slots' => array_map(function (array $slot) use ($tz) {
                    $starts = $slot['starts_at']->setTimezone($tz);

                    return [
                        'starts_at' => $slot['starts_at']->toIso8601String(),
                        'ends_at' => $slot['ends_at']->toIso8601String(),
                        'label' => $starts->format('g:i A'),
                        'available' => $slot['available'],
                    ];
                }, $slots),
            ];
        })->all();
    }
}
