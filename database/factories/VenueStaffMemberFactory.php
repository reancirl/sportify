<?php

namespace Database\Factories;

use App\Enums\VenueStaffRole;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueStaffMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VenueStaffMember>
 */
class VenueStaffMemberFactory extends Factory
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
            'user_id' => User::factory(),
            'role' => fake()->randomElement(VenueStaffRole::cases()),
        ];
    }
}
