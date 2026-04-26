<?php

namespace Database\Factories;

use App\Models\Venue;
use App\Models\VenueImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VenueImage>
 */
class VenueImageFactory extends Factory
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
            'image_path' => 'venues/'.fake()->uuid().'.jpg',
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
