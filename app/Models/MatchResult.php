<?php

namespace App\Models;

use App\Enums\MatchWinner;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Future-proofing for ranking; not used in MVP.
 */
class MatchResult extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'open_play_session_id',
        'court_id',
        'played_at',
        'team_a_player_ids',
        'team_b_player_ids',
        'team_a_score',
        'team_b_score',
        'winner',
        'elo_changes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'winner' => MatchWinner::class,
            'team_a_player_ids' => 'array',
            'team_b_player_ids' => 'array',
            'elo_changes' => 'array',
            'played_at' => 'datetime',
            'team_a_score' => 'integer',
            'team_b_score' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Court, $this>
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * @return BelongsTo<OpenPlaySession, $this>
     */
    public function openPlaySession(): BelongsTo
    {
        return $this->belongsTo(OpenPlaySession::class);
    }
}
