<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Court>
 */
class CourtFactory extends Factory
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
            'name' => 'Court '.fake()->numberBetween(1, 12),
            'description' => fake()->optional()->sentence(),
            'hourly_rate' => fake()->randomFloat(2, 200, 800),
            'slot_minutes' => 60,
            'is_active' => true,
        ];
    }
}
