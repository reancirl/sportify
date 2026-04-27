<?php

namespace App\Services\Booking;

use App\Enums\BookingStatus;
use App\Enums\SessionStatus;
use App\Exceptions\Domain\BookingCancellationWindowClosedException;
use App\Exceptions\Domain\SlotUnavailableException;
use App\Models\Booking;
use App\Models\Court;
use App\Models\OpenPlaySession;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\QueryException;
use Throwable;

class BookingService
{
    /**
     * Cancellation window in hours: a booking cannot be self-cancelled within
     * this many hours of its start time.
     */
    public const CANCELLATION_WINDOW_HOURS = 24;

    public function __construct(private readonly ConnectionInterface $db) {}

    /**
     * Build a list of slot descriptors for the given court on the given date.
     *
     * @return array<int, array{starts_at: CarbonImmutable, ends_at: CarbonImmutable, available: bool}>
     */
    public function availableSlots(Court $court, CarbonInterface $date): array
    {
        $court->loadMissing('venue');

        $slotMinutes = $court->slot_minutes ?: 60;
        $venue = $court->venue;
        $timezone = $venue->timezone ?? 'Asia/Manila';

        $localDate = CarbonImmutable::parse($date)->setTimezone($timezone)->startOfDay();
        $dayOfWeek = (int) $localDate->dayOfWeek;

        $hours = $venue->operatingHours()
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if ($hours === null || $hours->is_closed || $hours->opens_at === null || $hours->closes_at === null) {
            return [];
        }

        [$openHour, $openMinute] = $this->parseTime($hours->opens_at);
        [$closeHour, $closeMinute] = $this->parseTime($hours->closes_at);

        $opensAt = $localDate->setTime($openHour, $openMinute);
        $closesAt = $localDate->setTime($closeHour, $closeMinute);

        if ($closesAt->lessThanOrEqualTo($opensAt)) {
            return [];
        }

        $dayStartUtc = $opensAt->utc();
        $dayEndUtc = $closesAt->utc();

        $unavailabilities = $court->unavailabilities()
            ->where('starts_at', '<', $dayEndUtc)
            ->where('ends_at', '>', $dayStartUtc)
            ->get(['starts_at', 'ends_at']);

        $bookings = $court->bookings()
            ->whereIn('status', [
                BookingStatus::PendingPayment,
                BookingStatus::Confirmed,
                BookingStatus::Completed,
            ])
            ->where('starts_at', '<', $dayEndUtc)
            ->where('ends_at', '>', $dayStartUtc)
            ->get(['starts_at', 'ends_at']);

        $sessions = OpenPlaySession::query()
            ->where('venue_id', $court->venue_id)
            ->whereIn('status', [
                SessionStatus::Scheduled,
                SessionStatus::Full,
                SessionStatus::InProgress,
            ])
            ->where('starts_at', '<', $dayEndUtc)
            ->where('ends_at', '>', $dayStartUtc)
            ->get(['court_ids', 'starts_at', 'ends_at']);

        $sessionsBlockingThisCourt = $sessions->filter(
            fn (OpenPlaySession $session) => in_array($court->id, $session->court_ids ?? [], true),
        );

        $now = CarbonImmutable::now('UTC');
        $slots = [];

        $cursor = $opensAt;
        while ($cursor->copy()->addMinutes($slotMinutes)->lessThanOrEqualTo($closesAt)) {
            $slotStartUtc = $cursor->utc();
            $slotEndUtc = $cursor->copy()->addMinutes($slotMinutes)->utc();

            $available = true;

            // 5. Past slots if today
            if ($slotStartUtc->lessThanOrEqualTo($now)) {
                $available = false;
            }

            // 2. court_unavailabilities
            if ($available && $this->rangesOverlap($unavailabilities, $slotStartUtc, $slotEndUtc)) {
                $available = false;
            }

            // 3. existing bookings
            if ($available && $this->rangesOverlap($bookings, $slotStartUtc, $slotEndUtc)) {
                $available = false;
            }

            // 4. session windows blocking this court
            if ($available && $this->rangesOverlap($sessionsBlockingThisCourt, $slotStartUtc, $slotEndUtc)) {
                $available = false;
            }

            $slots[] = [
                'starts_at' => $slotStartUtc,
                'ends_at' => $slotEndUtc,
                'available' => $available,
            ];

            $cursor = $cursor->copy()->addMinutes($slotMinutes);
        }

        return $slots;
    }

    /**
     * Create a pending_payment booking for the given court starting at $startsAt.
     * $slotCount controls the duration: 1 = one court slot, 4 = four consecutive
     * slots stitched into a single booking.
     *
     * Pass $guest = ['name' => ..., 'email' => ..., 'phone' => ...] for a guest
     * checkout (when $user is null). Either $user or $guest is required.
     *
     * @param  array{name?: string, email?: string, phone?: ?string}|null  $guest
     *
     * @throws SlotUnavailableException
     */
    public function createBooking(
        ?User $user,
        Court $court,
        CarbonInterface $startsAt,
        int $slotCount = 1,
        ?array $guest = null,
    ): Booking {
        if ($user === null && ($guest === null || empty($guest['email']))) {
            throw new \InvalidArgumentException(
                'createBooking requires either an authenticated user or guest contact details.'
            );
        }

        $startsAtUtc = CarbonImmutable::parse($startsAt)->utc();
        $slotCount = max(1, min(12, $slotCount));

        try {
            return $this->db->transaction(function () use ($user, $court, $startsAtUtc, $slotCount, $guest): Booking {
                /** @var Court|null $lockedCourt */
                $lockedCourt = Court::query()
                    ->whereKey($court->id)
                    ->lockForUpdate()
                    ->first();

                if ($lockedCourt === null || ! $lockedCourt->is_active) {
                    throw new SlotUnavailableException($startsAtUtc);
                }

                $slotMinutes = $lockedCourt->slot_minutes ?: 60;
                $totalMinutes = $slotMinutes * $slotCount;
                $endsAtUtc = $startsAtUtc->copy()->addMinutes($totalMinutes);

                // Validate every slot in the requested span — not just the first.
                for ($i = 0; $i < $slotCount; $i++) {
                    $slotStart = $startsAtUtc->copy()->addMinutes($slotMinutes * $i);
                    $slotEnd = $slotStart->copy()->addMinutes($slotMinutes);

                    $this->assertSlotIsAvailable($lockedCourt, $slotStart, $slotEnd);
                }

                $total = (float) $lockedCourt->hourly_rate * ($totalMinutes / 60);

                return Booking::query()->create([
                    'court_id' => $lockedCourt->id,
                    'user_id' => $user?->id,
                    'guest_name' => $guest['name'] ?? null,
                    'guest_email' => $guest['email'] ?? null,
                    'guest_phone' => $guest['phone'] ?? null,
                    'starts_at' => $startsAtUtc,
                    'ends_at' => $endsAtUtc,
                    'total_amount' => round($total, 2),
                    'status' => BookingStatus::PendingPayment,
                ]);
            });
        } catch (QueryException $exception) {
            // Catches the unique(court_id, starts_at) DB constraint when concurrent
            // requests try to grab the same slot.
            if ($this->isUniqueConstraintViolation($exception)) {
                throw new SlotUnavailableException($startsAtUtc);
            }

            throw $exception;
        }
    }

    /**
     * Cancel a booking owned by $user, provided the cancellation window is open.
     *
     * @throws BookingCancellationWindowClosedException
     */
    public function cancelBooking(User $user, Booking $booking, ?string $reason = null): Booking
    {
        if ((int) $booking->user_id !== (int) $user->id) {
            throw new \DomainException('You may only cancel your own bookings.');
        }

        $now = CarbonImmutable::now('UTC');
        $startsAtUtc = $this->normalizeStoredDatetime($booking->starts_at);

        $minutesUntilStart = $now->diffInMinutes($startsAtUtc, false);

        if ($minutesUntilStart < self::CANCELLATION_WINDOW_HOURS * 60) {
            throw new BookingCancellationWindowClosedException($startsAtUtc);
        }

        $booking->forceFill([
            'status' => BookingStatus::Cancelled,
            'cancellation_reason' => $reason,
        ])->save();

        return $booking->refresh();
    }

    /**
     * Re-validate an exact slot against unavailabilities, bookings, and session windows.
     *
     * @throws SlotUnavailableException
     */
    private function assertSlotIsAvailable(Court $court, CarbonImmutable $startsAtUtc, CarbonImmutable $endsAtUtc): void
    {
        $now = CarbonImmutable::now('UTC');
        if ($startsAtUtc->lessThanOrEqualTo($now)) {
            throw new SlotUnavailableException($startsAtUtc);
        }

        $venue = $court->venue;
        $timezone = $venue?->timezone ?? 'Asia/Manila';

        $localStart = $startsAtUtc->setTimezone($timezone);
        $hours = $court->venue->operatingHours()
            ->where('day_of_week', (int) $localStart->dayOfWeek)
            ->first();

        if ($hours === null || $hours->is_closed || $hours->opens_at === null || $hours->closes_at === null) {
            throw new SlotUnavailableException($startsAtUtc);
        }

        [$openHour, $openMinute] = $this->parseTime($hours->opens_at);
        [$closeHour, $closeMinute] = $this->parseTime($hours->closes_at);

        $opensAt = $localStart->copy()->setTime($openHour, $openMinute)->utc();
        $closesAt = $localStart->copy()->setTime($closeHour, $closeMinute)->utc();

        if ($startsAtUtc->lessThan($opensAt) || $endsAtUtc->greaterThan($closesAt)) {
            throw new SlotUnavailableException($startsAtUtc);
        }

        $hasUnavailability = $court->unavailabilities()
            ->where('starts_at', '<', $endsAtUtc)
            ->where('ends_at', '>', $startsAtUtc)
            ->exists();

        if ($hasUnavailability) {
            throw new SlotUnavailableException($startsAtUtc);
        }

        $hasOverlappingBooking = $court->bookings()
            ->whereIn('status', [
                BookingStatus::PendingPayment,
                BookingStatus::Confirmed,
                BookingStatus::Completed,
            ])
            ->where('starts_at', '<', $endsAtUtc)
            ->where('ends_at', '>', $startsAtUtc)
            ->exists();

        if ($hasOverlappingBooking) {
            throw new SlotUnavailableException($startsAtUtc);
        }

        $blockingSessions = OpenPlaySession::query()
            ->where('venue_id', $court->venue_id)
            ->whereIn('status', [
                SessionStatus::Scheduled,
                SessionStatus::Full,
                SessionStatus::InProgress,
            ])
            ->where('starts_at', '<', $endsAtUtc)
            ->where('ends_at', '>', $startsAtUtc)
            ->get(['court_ids']);

        foreach ($blockingSessions as $session) {
            if (in_array($court->id, $session->court_ids ?? [], true)) {
                throw new SlotUnavailableException($startsAtUtc);
            }
        }
    }

    /**
     * @param  iterable<object{starts_at: mixed, ends_at: mixed}>  $ranges
     */
    private function rangesOverlap(iterable $ranges, CarbonImmutable $slotStart, CarbonImmutable $slotEnd): bool
    {
        foreach ($ranges as $range) {
            $start = $this->normalizeStoredDatetime($range->starts_at);
            $end = $this->normalizeStoredDatetime($range->ends_at);
            if ($start->lessThan($slotEnd) && $end->greaterThan($slotStart)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Reinterpret a datetime returned from Eloquent as UTC.
     *
     * Eloquent rehydrates datetimes using the application timezone
     * (`app.timezone`), but this project stores all datetimes in UTC.
     * This helper shifts the timezone label to UTC without altering
     * the underlying wall-clock value.
     */
    private function normalizeStoredDatetime(mixed $value): CarbonImmutable
    {
        if ($value instanceof CarbonInterface) {
            return CarbonImmutable::createFromFormat(
                'Y-m-d H:i:s',
                $value->format('Y-m-d H:i:s'),
                'UTC',
            );
        }

        return CarbonImmutable::parse((string) $value, 'UTC');
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function parseTime(mixed $time): array
    {
        $value = is_string($time) ? $time : (string) $time;
        $parts = explode(':', $value);
        $hour = (int) ($parts[0] ?? 0);
        $minute = (int) ($parts[1] ?? 0);

        return [$hour, $minute];
    }

    private function isUniqueConstraintViolation(Throwable $exception): bool
    {
        $code = $exception->getCode();
        $message = $exception->getMessage();

        return $code === '23000'
            || $code === 23000
            || str_contains($message, 'UNIQUE')
            || str_contains($message, 'Duplicate entry');
    }
}
