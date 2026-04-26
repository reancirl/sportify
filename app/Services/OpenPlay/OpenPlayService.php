<?php

namespace App\Services\OpenPlay;

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
use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;

class OpenPlayService
{
    public function __construct(private readonly ConnectionInterface $db) {}

    /**
     * Join a user to a scheduled open play session.
     *
     * @throws SessionNotJoinableException
     * @throws AlreadyJoinedSessionException
     * @throws SessionFullException
     * @throws SkillLevelMismatchException
     */
    public function joinSession(User $user, OpenPlaySession $session): SessionPlayer
    {
        return $this->db->transaction(function () use ($user, $session): SessionPlayer {
            /** @var OpenPlaySession|null $lockedSession */
            $lockedSession = OpenPlaySession::query()
                ->whereKey($session->id)
                ->lockForUpdate()
                ->first();

            if ($lockedSession === null) {
                throw new SessionNotJoinableException(SessionStatus::Cancelled);
            }

            if ($lockedSession->status !== SessionStatus::Scheduled) {
                throw new SessionNotJoinableException($lockedSession->status);
            }

            $alreadyJoined = SessionPlayer::query()
                ->where('session_id', $lockedSession->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($alreadyJoined) {
                throw new AlreadyJoinedSessionException;
            }

            $playerCount = SessionPlayer::query()
                ->where('session_id', $lockedSession->id)
                ->count();

            if ($playerCount >= $lockedSession->max_players) {
                throw new SessionFullException($lockedSession->max_players);
            }

            $this->assertSkillLevelMatches(
                $user->skill_level,
                $lockedSession->min_skill_level,
                $lockedSession->max_skill_level,
            );

            /** @var SessionPlayer $player */
            $player = SessionPlayer::query()->create([
                'session_id' => $lockedSession->id,
                'user_id' => $user->id,
                'joined_at' => CarbonImmutable::now('UTC'),
                'status' => SessionPlayerStatus::Registered,
                'payment_id' => null,
            ]);

            $newCount = $playerCount + 1;
            if ($newCount >= $lockedSession->max_players) {
                $lockedSession->forceFill(['status' => SessionStatus::Full])->save();
            }

            $player->load('session');

            return $player;
        });
    }

    /**
     * @throws SkillLevelMismatchException
     */
    private function assertSkillLevelMatches(?SkillLevel $userLevel, ?SkillLevel $min, ?SkillLevel $max): void
    {
        if ($min === null && $max === null) {
            return;
        }

        if ($userLevel === null) {
            throw new SkillLevelMismatchException($userLevel, $min, $max);
        }

        $userRank = $this->skillRank($userLevel);

        if ($min !== null && $userRank < $this->skillRank($min)) {
            throw new SkillLevelMismatchException($userLevel, $min, $max);
        }

        if ($max !== null && $userRank > $this->skillRank($max)) {
            throw new SkillLevelMismatchException($userLevel, $min, $max);
        }
    }

    private function skillRank(SkillLevel $level): int
    {
        return match ($level) {
            SkillLevel::Beginner => 1,
            SkillLevel::Intermediate => 2,
            SkillLevel::Advanced => 3,
            SkillLevel::Pro => 4,
        };
    }
}
