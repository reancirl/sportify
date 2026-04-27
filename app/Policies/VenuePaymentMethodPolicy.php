<?php

namespace App\Policies;

use App\Enums\VenueStaffRole;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenuePaymentMethod;

class VenuePaymentMethodPolicy
{
    /**
     * Payment methods are listed through the parent venue context; allow anyone
     * who can view the venue to also view its payment method list.
     */
    public function viewAny(User $user, Venue $venue): bool
    {
        return $this->canUpdateVenue($user, $venue);
    }

    /**
     * Viewing a single payment method requires update-level access to the venue.
     */
    public function view(User $user, VenuePaymentMethod $venuePaymentMethod): bool
    {
        return $this->canUpdateVenue($user, $venuePaymentMethod->venue);
    }

    /**
     * Creating a payment method requires update-level access to the venue.
     * Controllers must resolve the target venue and check this gate.
     */
    public function create(User $user, Venue $venue): bool
    {
        return $this->canUpdateVenue($user, $venue);
    }

    /**
     * Updating defers to the parent venue's update ability.
     */
    public function update(User $user, VenuePaymentMethod $venuePaymentMethod): bool
    {
        return $this->canUpdateVenue($user, $venuePaymentMethod->venue);
    }

    /**
     * Deletion defers to the parent venue's update ability (same access tier).
     */
    public function delete(User $user, VenuePaymentMethod $venuePaymentMethod): bool
    {
        return $this->canUpdateVenue($user, $venuePaymentMethod->venue);
    }

    /**
     * Returns true when the user has owner or manager-level access to $venue,
     * mirroring the logic in VenuePolicy::update.
     */
    protected function canUpdateVenue(User $user, Venue $venue): bool
    {
        if ($venue->owner_id === $user->id) {
            return true;
        }

        return $venue->staff()
            ->where('user_id', $user->id)
            ->whereIn('role', [VenueStaffRole::Owner->value, VenueStaffRole::Manager->value])
            ->exists();
    }
}
