<?php

namespace App\Policies;

use App\Enums\VenueStaffRole;
use App\Enums\VenueStatus;
use App\Models\User;
use App\Models\Venue;

class VenuePolicy
{
    /**
     * Determine whether the user can view any venues.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the venue.
     *
     * Approved venues are publicly viewable; unapproved venues are visible to
     * the owner and any staff member.
     */
    public function view(User $user, Venue $venue): bool
    {
        if ($venue->status === VenueStatus::Approved) {
            return true;
        }

        return $this->userBelongsToVenue($user, $venue);
    }

    /**
     * Anyone authenticated may apply to register a new venue.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Owner or any staff member with role owner/manager may update.
     */
    public function update(User $user, Venue $venue): bool
    {
        if ((int) $venue->owner_id === (int) $user->id) {
            return true;
        }

        return $this->userHasVenueRole($user, $venue, [VenueStaffRole::Owner, VenueStaffRole::Manager]);
    }

    /**
     * Only the owner may delete a venue.
     */
    public function delete(User $user, Venue $venue): bool
    {
        return (int) $venue->owner_id === (int) $user->id;
    }

    /**
     * Approval is super_admin only — handled by Gate::before.
     */
    public function approve(User $user, Venue $venue): bool
    {
        return false;
    }

    /**
     * Rejection is super_admin only — handled by Gate::before.
     */
    public function reject(User $user, Venue $venue): bool
    {
        return false;
    }

    /**
     * Suspension is super_admin only — handled by Gate::before.
     */
    public function suspend(User $user, Venue $venue): bool
    {
        return false;
    }

    /**
     * Reinstatement is super_admin only — handled by Gate::before.
     */
    public function reinstate(User $user, Venue $venue): bool
    {
        return false;
    }

    /**
     * Only the owner may restore.
     */
    public function restore(User $user, Venue $venue): bool
    {
        return (int) $venue->owner_id === (int) $user->id;
    }

    /**
     * Force delete is super_admin only — handled by Gate::before.
     */
    public function forceDelete(User $user, Venue $venue): bool
    {
        return false;
    }

    protected function userBelongsToVenue(User $user, Venue $venue): bool
    {
        if ((int) $venue->owner_id === (int) $user->id) {
            return true;
        }

        return $venue->staff()->where('user_id', $user->id)->exists();
    }

    /**
     * @param  array<int, VenueStaffRole>  $roles
     */
    protected function userHasVenueRole(User $user, Venue $venue, array $roles): bool
    {
        return $venue->staff()
            ->where('user_id', $user->id)
            ->whereIn('role', array_map(fn (VenueStaffRole $r) => $r->value, $roles))
            ->exists();
    }
}
