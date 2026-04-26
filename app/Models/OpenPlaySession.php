<?php

namespace App\Models;

use App\Enums\SessionStatus;
use App\Enums\SkillLevel;
use Database\Factories\OpenPlaySessionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OpenPlaySession extends Model
{
    /** @use HasFactory<OpenPlaySessionFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'venue_id',
        'created_by',
        'title',
        'description',
        'starts_at',
        'ends_at',
        'max_players',
        'min_skill_level',
        'max_skill_level',
        'fee_per_player',
        'court_ids',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SessionStatus::class,
            'min_skill_level' => SkillLevel::class,
            'max_skill_level' => SkillLevel::class,
            'court_ids' => 'array',
            'fee_per_player' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'max_players' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<SessionPlayer, $this>
     */
    public function players(): HasMany
    {
        return $this->hasMany(SessionPlayer::class, 'session_id');
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>=', now());
    }
}
