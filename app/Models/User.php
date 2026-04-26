<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\SkillLevel;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar_path', 'skill_level', 'elo_rating', 'is_active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'skill_level' => SkillLevel::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * Scope to only active users.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Venues owned by this user.
     *
     * @return HasMany<Venue, $this>
     */
    public function venuesOwned(): HasMany
    {
        return $this->hasMany(Venue::class, 'owner_id');
    }

    /**
     * Venue staff memberships for this user.
     *
     * @return HasMany<VenueStaffMember, $this>
     */
    public function venueMemberships(): HasMany
    {
        return $this->hasMany(VenueStaffMember::class);
    }

    /**
     * Bookings created by this user.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Open-play session entries for this user.
     *
     * @return HasMany<SessionPlayer, $this>
     */
    public function sessionEntries(): HasMany
    {
        return $this->hasMany(SessionPlayer::class);
    }

    /**
     * Payments submitted by this user.
     *
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Payments verified by this user.
     *
     * @return HasMany<Payment, $this>
     */
    public function verifiedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'verified_by');
    }
}
