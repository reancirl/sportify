<?php

namespace Database\Factories;

use App\Enums\SessionStatus;
use App\Enums\SkillLevel;
use App\Models\OpenPlaySession;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OpenPlaySession>
 */
class OpenPlaySessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+2 weeks')
            ->setTime((int) fake()->numberBetween(8, 19), 0);
        $endsAt = (clone $startsAt)->modify('+2 hours');

        return [
            'venue_id' => Venue::factory(),
            'created_by' => User::factory(),
            'title' => fake()->randomElement(['Friday Night Open Play', 'Sunday Morning Round Robin', 'Beginner Mixer']),
            'description' => fake()->paragraph(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'max_players' => fake()->randomElement([8, 12, 16, 20]),
            'min_skill_level' => SkillLevel::Beginner,
            'max_skill_level' => SkillLevel::Advanced,
            'fee_per_player' => fake()->randomFloat(2, 100, 350),
            'court_ids' => [],
            'status' => SessionStatus::Scheduled,
        ];
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SessionStatus::Scheduled,
        ]);
    }

    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SessionStatus::Full,
        ]);
    }
}
