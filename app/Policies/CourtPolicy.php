<?php

namespace App\Policies;

use App\Enums\VenueStaffRole;
use App\Models\Court;
use App\Models\User;
use App\Models\Venue;

class CourtPolicy
{
    /**
     * Anyone may list courts.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone may view a single court.
     */
    public function view(?User $user, Court $court): bool
    {
        return true;
    }

    /**
     * Court create is wired through the parent venue; controllers must
     * resolve the venue and authorize against this method.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Venue owner or staff with manager+ may update.
     */
    public function update(User $user, Court $court): bool
    {
        return $this->userHasManagerAccess($user, $court->venue);
    }

    /**
     * Only the venue owner may delete a court.
     */
    public function delete(User $user, Court $court): bool
    {
        return (int) $court->venue->owner_id === (int) $user->id;
    }

    public function restore(User $user, Court $court): bool
    {
        return (int) $court->venue->owner_id === (int) $user->id;
    }

    public function forceDelete(User $user, Court $court): bool
    {
        return false;
    }

    protected function userHasManagerAccess(User $user, Venue $venue): bool
    {
        if ((int) $venue->owner_id === (int) $user->id) {
            return true;
        }

        return $venue->staff()
            ->where('user_id', $user->id)
            ->whereIn('role', [VenueStaffRole::Owner->value, VenueStaffRole::Manager->value])
            ->exists();
    }
}
