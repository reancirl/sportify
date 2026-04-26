<?php

namespace Database\Factories;

use App\Enums\SessionPlayerStatus;
use App\Models\OpenPlaySession;
use App\Models\SessionPlayer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SessionPlayer>
 */
class SessionPlayerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'session_id' => OpenPlaySession::factory(),
            'user_id' => User::factory(),
            'joined_at' => now(),
            'status' => SessionPlayerStatus::Registered,
            'payment_id' => null,
        ];
    }
}
