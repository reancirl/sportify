<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use App\Models\Venue;

class BookingPolicy
{
    /**
     * Any authenticated user may list bookings (controller scopes to their own).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Booking owner or staff/owner of the venue may view.
     */
    public function view(User $user, Booking $booking): bool
    {
        if ((int) $booking->user_id === (int) $user->id) {
            return true;
        }

        return $this->userBelongsToVenue($user, $booking->court->venue);
    }

    /**
     * Any authenticated user may create a booking.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Venue staff/owner may update bookings (e.g., add notes, mark complete).
     */
    public function update(User $user, Booking $booking): bool
    {
        return $this->userBelongsToVenue($user, $booking->court->venue);
    }

    /**
     * Booking owner OR venue owner/staff may cancel.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ((int) $booking->user_id === (int) $user->id) {
            return true;
        }

        return $this->userBelongsToVenue($user, $booking->court->venue);
    }

    /**
     * Hard delete is super_admin only — handled by Gate::before.
     */
    public function delete(User $user, Booking $booking): bool
    {
        return false;
    }

    public function restore(User $user, Booking $booking): bool
    {
        return false;
    }

    public function forceDelete(User $user, Booking $booking): bool
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
}
