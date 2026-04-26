<?php

namespace App\Models;

use Database\Factories\VenueOperatingHourFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenueOperatingHour extends Model
{
    /** @use HasFactory<VenueOperatingHourFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'venue_id',
        'day_of_week',
        'opens_at',
        'closes_at',
        'is_closed',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_closed' => 'boolean',
            'day_of_week' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}
