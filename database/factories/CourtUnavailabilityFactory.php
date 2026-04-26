<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\CourtUnavailability;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourtUnavailability>
 */
class CourtUnavailabilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+1 month');
        $endsAt = (clone $startsAt)->modify('+2 hours');

        return [
            'court_id' => Court::factory(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'reason' => fake()->optional()->sentence(),
        ];
    }
}
