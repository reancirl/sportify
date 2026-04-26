<?php

namespace Tests\Feature\Booking;

use App\Enums\BookingStatus;
use App\Enums\SessionStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtUnavailability;
use App\Models\OpenPlaySession;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueOperatingHour;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AvailableSlotsTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(BookingService::class);
    }

    private function makeCourt(string $timezone = 'Asia/Manila'): Court
    {
        $venue = Venue::factory()->approved()->create(['timezone' => $timezone]);

        // Open every day from 08:00 to 22:00 local time
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
            'slot_minutes' => 60,
            'hourly_rate' => 300,
        ]);
    }

    public function test_generates_hourly_slots_within_operating_hours(): void
    {
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $tomorrow = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        $slots = $this->service->availableSlots($court, $tomorrow);

        // 08:00 - 22:00 = 14 one-hour slots
        $this->assertCount(14, $slots);
        $this->assertTrue($slots[0]['available']);

        $firstStartLocal = $slots[0]['starts_at']->setTimezone('Asia/Manila');
        $this->assertSame('08:00', $firstStartLocal->format('H:i'));

        $lastStartLocal = $slots[13]['starts_at']->setTimezone('Asia/Manila');
        $this->assertSame('21:00', $lastStartLocal->format('H:i'));
    }

    public function test_returns_empty_when_venue_is_closed_for_the_day(): void
    {
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $tomorrow = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        $court->venue->operatingHours()
            ->where('day_of_week', (int) $tomorrow->dayOfWeek)
            ->update([
                'is_closed' => true,
                'opens_at' => null,
                'closes_at' => null,
            ]);

        $slots = $this->service->availableSlots($court, $tomorrow);

        $this->assertSame([], $slots);
    }

    public function test_marks_existing_booking_slot_as_unavailable(): void
    {
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $tomorrow = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        $bookingStart = $tomorrow->copy()->setTime(10, 0)->utc();
        Booking::factory()->confirmed()->create([
            'court_id' => $court->id,
            'starts_at' => $bookingStart,
            'ends_at' => $bookingStart->copy()->addHour(),
        ]);

        $slots = $this->service->availableSlots($court, $tomorrow);

        $tenAm = $this->findSlotStartingAtLocal($slots, '10:00');
        $this->assertNotNull($tenAm);
        $this->assertFalse($tenAm['available']);

        $elevenAm = $this->findSlotStartingAtLocal($slots, '11:00');
        $this->assertNotNull($elevenAm);
        $this->assertTrue($elevenAm['available']);
    }

    public function test_excludes_court_unavailability_ranges(): void
    {
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $tomorrow = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        CourtUnavailability::factory()->create([
            'court_id' => $court->id,
            'starts_at' => $tomorrow->copy()->setTime(13, 0)->utc(),
            'ends_at' => $tomorrow->copy()->setTime(15, 0)->utc(),
        ]);

        $slots = $this->service->availableSlots($court, $tomorrow);

        $this->assertFalse($this->findSlotStartingAtLocal($slots, '13:00')['available']);
        $this->assertFalse($this->findSlotStartingAtLocal($slots, '14:00')['available']);
        $this->assertTrue($this->findSlotStartingAtLocal($slots, '15:00')['available']);
    }

    public function test_excludes_slots_blocked_by_open_play_sessions(): void
    {
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $tomorrow = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        OpenPlaySession::factory()->scheduled()->create([
            'venue_id' => $court->venue_id,
            'starts_at' => $tomorrow->copy()->setTime(18, 0)->utc(),
            'ends_at' => $tomorrow->copy()->setTime(20, 0)->utc(),
            'court_ids' => [$court->id],
        ]);

        $slots = $this->service->availableSlots($court, $tomorrow);

        $this->assertFalse($this->findSlotStartingAtLocal($slots, '18:00')['available']);
        $this->assertFalse($this->findSlotStartingAtLocal($slots, '19:00')['available']);
        $this->assertTrue($this->findSlotStartingAtLocal($slots, '20:00')['available']);
    }

    public function test_marks_past_slots_as_unavailable_when_date_is_today(): void
    {
        // Local time is 14:30 in Manila — slots before 15:00 should be unavailable.
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-05 14:30:00', 'Asia/Manila'));

        $court = $this->makeCourt();
        $today = CarbonImmutable::parse('2026-05-05', 'Asia/Manila');

        $slots = $this->service->availableSlots($court, $today);

        $this->assertFalse($this->findSlotStartingAtLocal($slots, '08:00')['available']);
        $this->assertFalse($this->findSlotStartingAtLocal($slots, '14:00')['available']);
        $this->assertTrue($this->findSlotStartingAtLocal($slots, '15:00')['available']);
    }

    /**
     * @param  array<int, array{starts_at: CarbonImmutable, ends_at: CarbonImmutable, available: bool}>  $slots
     * @return array{starts_at: CarbonImmutable, ends_at: CarbonImmutable, available: bool}|null
     */
    private function findSlotStartingAtLocal(array $slots, string $hhmm): ?array
    {
        foreach ($slots as $slot) {
            if ($slot['starts_at']->setTimezone('Asia/Manila')->format('H:i') === $hhmm) {
                return $slot;
            }
        }

        return null;
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }
}
