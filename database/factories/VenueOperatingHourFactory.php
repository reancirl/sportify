<?php

namespace Database\Factories;

use App\Models\Venue;
use App\Models\VenueOperatingHour;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VenueOperatingHour>
 */
class VenueOperatingHourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'venue_id' => Venue::factory(),
            'day_of_week' => fake()->numberBetween(0, 6),
            'opens_at' => '08:00:00',
            'closes_at' => '22:00:00',
            'is_closed' => false,
        ];
    }
}
