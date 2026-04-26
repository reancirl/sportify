<?php

namespace App\Policies;

use App\Models\OpenPlaySession;
use App\Models\User;
use App\Models\Venue;

class OpenPlaySessionPolicy
{
    /**
     * Anyone may list sessions.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Anyone may view a session.
     */
    public function view(?User $user, OpenPlaySession $openPlaySession): bool
    {
        return true;
    }

    /**
     * Sessions are created by venue owner/staff; controllers resolve the venue
     * and authorize accordingly.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Session creator OR venue owner/staff may update.
     */
    public function update(User $user, OpenPlaySession $openPlaySession): bool
    {
        if ((int) $openPlaySession->created_by === (int) $user->id) {
            return true;
        }

        return $this->userBelongsToVenue($user, $openPlaySession->venue);
    }

    /**
     * Creator OR venue owner may delete.
     */
    public function delete(User $user, OpenPlaySession $openPlaySession): bool
    {
        if ((int) $openPlaySession->created_by === (int) $user->id) {
            return true;
        }

        return (int) $openPlaySession->venue->owner_id === (int) $user->id;
    }

    /**
     * Any authenticated user may join a session (capacity/skill checks live in services).
     */
    public function join(User $user, OpenPlaySession $openPlaySession): bool
    {
        return true;
    }

    public function restore(User $user, OpenPlaySession $openPlaySession): bool
    {
        return false;
    }

    public function forceDelete(User $user, OpenPlaySession $openPlaySession): bool
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
