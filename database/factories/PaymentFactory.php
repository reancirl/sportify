<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payable_type' => (new Booking)->getMorphClass(),
            'payable_id' => Booking::factory(),
            'user_id' => User::factory(),
            'amount' => fake()->randomFloat(2, 200, 1500),
            'proof_image_path' => null,
            'reference_number' => null,
            'status' => PaymentStatus::Pending,
            'verified_by' => null,
            'verified_at' => null,
            'rejection_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Pending,
            'verified_by' => null,
            'verified_at' => null,
            'rejection_reason' => null,
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Verified,
            'verified_by' => User::factory(),
            'verified_at' => now(),
            'proof_image_path' => 'payments/'.fake()->uuid().'.jpg',
            'rejection_reason' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Rejected,
            'verified_by' => User::factory(),
            'verified_at' => now(),
            'rejection_reason' => fake()->sentence(),
        ]);
    }
}
