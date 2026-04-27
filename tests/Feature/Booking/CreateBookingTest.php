<?php

namespace Tests\Feature\Booking;

use App\Enums\BookingStatus;
use App\Exceptions\Domain\SlotUnavailableException;
use App\Models\Booking;
use App\Models\Court;
use App\Models\OpenPlaySession;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueOperatingHour;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CreateBookingTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(BookingService::class);

        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));
    }

    private function makeCourt(float $hourlyRate = 400, int $slotMinutes = 60): Court
    {
        $venue = Venue::factory()->approved()->create(['timezone' => 'Asia/Manila']);

        for ($day = 0; $day < 7; $day++) {
            VenueOperatingHour::factory()->create([
                'venue_id' => $venue->id,
                'day_of_week' => $day,
                'opens_at' => '08:00:00',
                'closes_at' => '22:00:00',
                'is_closed' => false,
            ]);
        }

        return Court::factory()->create([
            'venue_id' => $venue->id,
            'hourly_rate' => $hourlyRate,
            'slot_minutes' => $slotMinutes,
        ]);
    }

    public function test_creates_pending_payment_booking_with_correct_total(): void
    {
        $user = User::factory()->create();
        $court = $this->makeCourt(450, 60);
        $startsAt = CarbonImmutable::parse('2026-05-05 10:00:00', 'Asia/Manila');

        $booking = $this->service->createBooking($user, $court, $startsAt);

        $this->assertSame(BookingStatus::PendingPayment, $booking->status);
        $this->assertSame('450.00', (string) $booking->total_amount);
        $this->assertSame((string) $user->id, (string) $booking->user_id);
        $this->assertSame($court->id, $booking->court_id);

        // The model rehydrates datetimes in the app timezone (Asia/Manila),
        // but the underlying stored value is UTC. Compare the formatted string
        // to the UTC representation without re-applying ->utc().
        $this->assertSame(
            $startsAt->utc()->format('Y-m-d H:i:s'),
            $booking->starts_at->format('Y-m-d H:i:s'),
        );

        $this->assertSame(
            $startsAt->copy()->addHour()->utc()->format('Y-m-d H:i:s'),
            $booking->ends_at->format('Y-m-d H:i:s'),
        );
    }

    public function test_throws_slot_unavailable_when_an_overlapping_booking_exists(): void
    {
        $user = User::factory()->create();
        $court = $this->makeCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 10:00:00', 'Asia/Manila');

        Booking::factory()->confirmed()->create([
            'court_id' => $court->id,
            'starts_at' => $startsAt->utc(),
            'ends_at' => $startsAt->copy()->addHour()->utc(),
        ]);

        $this->expectException(SlotUnavailableException::class);

        $this->service->createBooking($user, $court, $startsAt);
    }

    public function test_unique_constraint_translates_to_slot_unavailable_exception(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $court = $this->makeCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 09:00:00', 'Asia/Manila');

        $first = $this->service->createBooking($userA, $court, $startsAt);
        $this->assertNotNull($first->id);

        $this->expectException(SlotUnavailableException::class);

        // The second call hits the same exact start time — service should
        // surface a SlotUnavailableException either via assertSlotIsAvailable
        // or via the DB unique(court_id, starts_at) constraint.
        $this->service->createBooking($userB, $court, $startsAt);
    }

    public function test_creates_a_multi_slot_booking_with_extended_duration_and_total(): void
    {
        $user = User::factory()->create();
        $court = $this->makeCourt(400, 60);
        $startsAt = CarbonImmutable::parse('2026-05-05 09:00:00', 'Asia/Manila');

        $booking = $this->service->createBooking($user, $court, $startsAt, 3);

        // 3 × ₱400 = ₱1,200
        $this->assertSame('1200.00', (string) $booking->total_amount);

        $this->assertSame(
            $startsAt->utc()->format('Y-m-d H:i:s'),
            $booking->starts_at->format('Y-m-d H:i:s'),
        );

        $this->assertSame(
            $startsAt->copy()->addHours(3)->utc()->format('Y-m-d H:i:s'),
            $booking->ends_at->format('Y-m-d H:i:s'),
        );
    }

    public function test_multi_slot_booking_fails_if_one_inner_slot_is_taken(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $court = $this->makeCourt(400, 60);
        $startsAt = CarbonImmutable::parse('2026-05-05 09:00:00', 'Asia/Manila');

        // Block the middle slot only — first and third would otherwise be free.
        Booking::factory()->confirmed()->create([
            'user_id' => $other->id,
            'court_id' => $court->id,
            'starts_at' => $startsAt->copy()->addHour()->utc(),
            'ends_at' => $startsAt->copy()->addHours(2)->utc(),
        ]);

        $this->expectException(SlotUnavailableException::class);

        $this->service->createBooking($user, $court, $startsAt, 3);
    }

    public function test_throws_slot_unavailable_when_court_is_in_a_session_window(): void
    {
        $user = User::factory()->create();
        $court = $this->makeCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 18:00:00', 'Asia/Manila');

        OpenPlaySession::factory()->scheduled()->create([
            'venue_id' => $court->venue_id,
            'starts_at' => $startsAt->copy()->setTime(17, 0)->utc(),
            'ends_at' => $startsAt->copy()->setTime(21, 0)->utc(),
            'court_ids' => [$court->id],
        ]);

        $this->expectException(SlotUnavailableException::class);

        $this->service->createBooking($user, $court, $startsAt);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }
}
