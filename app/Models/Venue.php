<?php

namespace App\Models;

use App\Enums\VenueStatus;
use Database\Factories\VenueFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model
{
    /** @use HasFactory<VenueFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'description',
        'address_line',
        'barangay',
        'city',
        'province',
        'region',
        'postal_code',
        'google_maps_url',
        'latitude',
        'longitude',
        'contact_phone',
        'contact_email',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'tiktok_url',
        'website_url',
        'amenities',
        'advance_booking_weeks',
        'cover_image_path',
        'timezone',
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => VenueStatus::class,
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'approved_at' => 'datetime',
            'amenities' => 'array',
            'advance_booking_weeks' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * @return HasMany<VenueStaffMember, $this>
     */
    public function staff(): HasMany
    {
        return $this->hasMany(VenueStaffMember::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function staffMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'venue_staff')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return HasMany<VenueImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(VenueImage::class);
    }

    /**
     * @return HasMany<VenueOperatingHour, $this>
     */
    public function operatingHours(): HasMany
    {
        return $this->hasMany(VenueOperatingHour::class);
    }

    /**
     * @return HasMany<Court, $this>
     */
    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }

    /**
     * @return HasMany<OpenPlaySession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(OpenPlaySession::class);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', VenueStatus::Approved);
    }

    public function scopeInCity(Builder $query, string $city): Builder
    {
        return $query->where('city', $city);
    }
}
