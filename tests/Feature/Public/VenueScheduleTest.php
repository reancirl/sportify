<?php

namespace Tests\Feature\Public;

use App\Models\Court;
use App\Models\Venue;
use App\Models\VenueOperatingHour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VenueScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_view_a_venues_schedule(): void
    {
        $venue = Venue::factory()->approved()->create([
            'city' => 'Iligan City',
            'timezone' => 'Asia/Manila',
        ]);

        // Open every day so the schedule has slots regardless of test date.
        for ($day = 0; $day <= 6; $day++) {
            VenueOperatingHour::factory()->create([
                'venue_id' => $venue->id,
                'day_of_week' => $day,
                'opens_at' => '08:00:00',
                'closes_at' => '20:00:00',
                'is_closed' => false,
            ]);
        }

        Court::factory()->count(2)->create([
            'venue_id' => $venue->id,
            'is_active' => true,
            'slot_minutes' => 60,
        ]);

        // No auth — must work for guests.
        $response = $this->get("/venues/{$venue->slug}");

        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('public/venue-show')
            ->has('schedule', 2)
            ->has('schedule.0.slots')
            ->has('schedule.0.court', fn (Assert $court) => $court
                ->where('id', fn ($id) => is_string($id))
                ->where('name', fn ($name) => is_string($name))
                ->etc()
            )
            ->has('selectedDate')
            ->has('dateOptions', 7)
            ->has('earliestDate')
            ->has('latestDate')
        );
    }

    public function test_jumping_to_a_far_date_within_advance_window_works(): void
    {
        $venue = Venue::factory()->approved()->create([
            'city' => 'Iligan City',
            'timezone' => 'Asia/Manila',
            'advance_booking_weeks' => 4,
        ]);

        for ($day = 0; $day <= 6; $day++) {
            VenueOperatingHour::factory()->create([
                'venue_id' => $venue->id,
                'day_of_week' => $day,
                'opens_at' => '08:00:00',
                'closes_at' => '20:00:00',
                'is_closed' => false,
            ]);
        }

        Court::factory()->create([
            'venue_id' => $venue->id,
            'is_active' => true,
            'slot_minutes' => 60,
        ]);

        $threeWeeksOut = now('Asia/Manila')->addWeeks(3)->startOfDay()->toDateString();

        $response = $this->get("/venues/{$venue->slug}?date={$threeWeeksOut}");

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('public/venue-show')
            ->where('selectedDate', $threeWeeksOut)
        );
    }

    public function test_dates_outside_advance_window_fall_back_to_today(): void
    {
        $venue = Venue::factory()->approved()->create([
            'city' => 'Iligan City',
            'timezone' => 'Asia/Manila',
            'advance_booking_weeks' => 1,
        ]);

        VenueOperatingHour::factory()->create([
            'venue_id' => $venue->id,
            'day_of_week' => (int) now('Asia/Manila')->dayOfWeek,
            'opens_at' => '08:00:00',
            'closes_at' => '20:00:00',
            'is_closed' => false,
        ]);

        Court::factory()->create(['venue_id' => $venue->id, 'is_active' => true]);

        $tooFar = now('Asia/Manila')->addMonths(2)->toDateString();
        $today = now('Asia/Manila')->startOfDay()->toDateString();

        $response = $this->get("/venues/{$venue->slug}?date={$tooFar}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('selectedDate', $today)
        );
    }

    public function test_guests_get_404_for_unapproved_venues(): void
    {
        $venue = Venue::factory()->pending()->create([
            'city' => 'Iligan City',
        ]);

        $this->get("/venues/{$venue->slug}")->assertNotFound();
    }
}
