<?php

namespace Tests\Feature\Booking;

use App\Enums\BookingStatus;
use App\Exceptions\Domain\BookingCancellationWindowClosedException;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Services\Booking\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CancelBookingTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(BookingService::class);

        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 12:00:00', 'UTC'));
    }

    public function test_cancels_when_more_than_24_hours_before_start(): void
    {
        $user = User::factory()->create();
        $court = Court::factory()->create();

        $booking = Booking::factory()->confirmed()->create([
            'user_id' => $user->id,
            'court_id' => $court->id,
            'starts_at' => CarbonImmutable::now('UTC')->addDays(2),
            'ends_at' => CarbonImmutable::now('UTC')->addDays(2)->addHour(),
        ]);

        $cancelled = $this->service->cancelBooking($user, $booking, 'Cannot make it.');

        $this->assertSame(BookingStatus::Cancelled, $cancelled->status);
        $this->assertSame('Cannot make it.', $cancelled->cancellation_reason);
    }

    public function test_throws_when_within_24_hour_window(): void
    {
        $user = User::factory()->create();
        $court = Court::factory()->create();

        $booking = Booking::factory()->confirmed()->create([
            'user_id' => $user->id,
            'court_id' => $court->id,
            'starts_at' => CarbonImmutable::now('UTC')->addHours(12),
            'ends_at' => CarbonImmutable::now('UTC')->addHours(13),
        ]);

        $this->expectException(BookingCancellationWindowClosedException::class);

        $this->service->cancelBooking($user, $booking);
    }

    public function test_records_provided_reason(): void
    {
        $user = User::factory()->create();
        $court = Court::factory()->create();

        $booking = Booking::factory()->confirmed()->create([
            'user_id' => $user->id,
            'court_id' => $court->id,
            'starts_at' => CarbonImmutable::now('UTC')->addDays(3),
            'ends_at' => CarbonImmutable::now('UTC')->addDays(3)->addHour(),
        ]);

        $cancelled = $this->service->cancelBooking($user, $booking, 'Schedule conflict.');

        $this->assertSame('Schedule conflict.', $cancelled->cancellation_reason);
        $this->assertSame(BookingStatus::Cancelled, $cancelled->status);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }
}
