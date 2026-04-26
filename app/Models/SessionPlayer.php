<?php

namespace App\Models;

use App\Enums\SessionPlayerStatus;
use Database\Factories\SessionPlayerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionPlayer extends Model
{
    /** @use HasFactory<SessionPlayerFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'session_id',
        'user_id',
        'joined_at',
        'status',
        'payment_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SessionPlayerStatus::class,
            'joined_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<OpenPlaySession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(OpenPlaySession::class, 'session_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Payment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
