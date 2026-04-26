<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+2 weeks')
            ->setTime((int) fake()->numberBetween(8, 20), 0);
        $endsAt = (clone $startsAt)->modify('+1 hour');

        return [
            'court_id' => Court::factory(),
            'user_id' => User::factory(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'total_amount' => fake()->randomFloat(2, 200, 800),
            'status' => BookingStatus::PendingPayment,
            'cancellation_reason' => null,
            'notes' => null,
        ];
    }

    public function pendingPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BookingStatus::PendingPayment,
            'cancellation_reason' => null,
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BookingStatus::Confirmed,
            'cancellation_reason' => null,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BookingStatus::Cancelled,
            'cancellation_reason' => fake()->sentence(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BookingStatus::Completed,
            'cancellation_reason' => null,
        ]);
    }
}
