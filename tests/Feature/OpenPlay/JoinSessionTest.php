<?php

namespace Tests\Feature\OpenPlay;

use App\Enums\SessionPlayerStatus;
use App\Enums\SessionStatus;
use App\Enums\SkillLevel;
use App\Exceptions\Domain\AlreadyJoinedSessionException;
use App\Exceptions\Domain\SessionFullException;
use App\Exceptions\Domain\SessionNotJoinableException;
use App\Exceptions\Domain\SkillLevelMismatchException;
use App\Models\OpenPlaySession;
use App\Models\SessionPlayer;
use App\Models\User;
use App\Services\OpenPlay\OpenPlayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JoinSessionTest extends TestCase
{
    use RefreshDatabase;

    private OpenPlayService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(OpenPlayService::class);
    }

    public function test_joins_when_session_is_scheduled_and_has_space(): void
    {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'max_players' => 8,
            'min_skill_level' => SkillLevel::Beginner,
            'max_skill_level' => SkillLevel::Pro,
        ]);

        $user = User::factory()->create(['skill_level' => SkillLevel::Intermediate]);

        $player = $this->service->joinSession($user, $session);

        $this->assertSame((string) $session->id, (string) $player->session_id);
        $this->assertSame((int) $user->id, (int) $player->user_id);
        $this->assertSame(SessionPlayerStatus::Registered, $player->status);
        $this->assertNull($player->payment_id);
    }

    public function test_throws_when_session_is_already_full(): void
    {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'max_players' => 2,
            'min_skill_level' => null,
            'max_skill_level' => null,
        ]);

        SessionPlayer::factory()->count(2)->create(['session_id' => $session->id]);

        $user = User::factory()->create();

        $this->expectException(SessionFullException::class);

        $this->service->joinSession($user, $session);
    }

    public function test_throws_when_user_already_joined(): void
    {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'max_players' => 8,
            'min_skill_level' => null,
            'max_skill_level' => null,
        ]);

        $user = User::factory()->create();

        SessionPlayer::factory()->create([
            'session_id' => $session->id,
            'user_id' => $user->id,
        ]);

        $this->expectException(AlreadyJoinedSessionException::class);

        $this->service->joinSession($user, $session);
    }

    public function test_throws_when_user_skill_level_does_not_match(): void
    {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'max_players' => 8,
            'min_skill_level' => SkillLevel::Advanced,
            'max_skill_level' => SkillLevel::Pro,
        ]);

        $user = User::factory()->create(['skill_level' => SkillLevel::Beginner]);

        $this->expectException(SkillLevelMismatchException::class);

        $this->service->joinSession($user, $session);
    }

    public function test_throws_when_session_status_is_cancelled(): void
    {
        $session = OpenPlaySession::factory()->create([
            'status' => SessionStatus::Cancelled,
            'max_players' => 8,
            'min_skill_level' => null,
            'max_skill_level' => null,
        ]);

        $user = User::factory()->create();

        $this->expectException(SessionNotJoinableException::class);

        $this->service->joinSession($user, $session);
    }

    public function test_flips_session_to_full_when_capacity_reached(): void
    {
        $session = OpenPlaySession::factory()->scheduled()->create([
            'max_players' => 2,
            'min_skill_level' => null,
            'max_skill_level' => null,
        ]);

        SessionPlayer::factory()->create(['session_id' => $session->id]);

        $user = User::factory()->create();

        $this->service->joinSession($user, $session);

        $session->refresh();
        $this->assertSame(SessionStatus::Full, $session->status);
    }
}
