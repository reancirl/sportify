<?php

namespace App\Models;

use App\Enums\VenueStaffRole;
use Database\Factories\VenueStaffMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenueStaffMember extends Model
{
    /** @use HasFactory<VenueStaffMemberFactory> */
    use HasFactory;

    protected $table = 'venue_staff';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'venue_id',
        'user_id',
        'role',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => VenueStaffRole::class,
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
