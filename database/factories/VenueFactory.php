<?php

namespace Database\Factories;

use App\Enums\VenueStatus;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Venue>
 */
class VenueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company().' Pickleball Club';

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'description' => fake()->paragraph(),
            'address_line' => fake()->streetAddress(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'region' => 'NCR',
            'latitude' => fake()->latitude(4.5, 21.0),
            'longitude' => fake()->longitude(116.0, 127.0),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'cover_image_path' => null,
            'timezone' => 'Asia/Manila',
            'status' => VenueStatus::Pending,
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VenueStatus::Pending,
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VenueStatus::Approved,
            'approved_at' => now(),
            'approved_by' => User::factory(),
            'rejection_reason' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VenueStatus::Rejected,
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VenueStatus::Suspended,
        ]);
    }
}
