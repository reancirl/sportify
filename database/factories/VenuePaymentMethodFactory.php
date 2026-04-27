<?php

namespace Database\Factories;

use App\Enums\PaymentProvider;
use App\Models\Venue;
use App\Models\VenuePaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VenuePaymentMethod>
 */
class VenuePaymentMethodFactory extends Factory
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
            'provider' => fake()->randomElement(PaymentProvider::cases()),
            'account_name' => fake()->name(),
            'mobile_number' => '09'.fake()->numerify('#########'),
            'qr_code_path' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function gcash(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => PaymentProvider::Gcash,
        ]);
    }

    public function maya(): static
    {
        return $this->state(fn (array $attributes) => [
            'provider' => PaymentProvider::Maya,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
