<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\SessionPlayer;
use App\Models\User;
use App\Models\Venue;

class PaymentPolicy
{
    /**
     * Any authenticated user may list payments (controller scopes to their own).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Payment owner OR venue owner/staff for the related venue may view.
     */
    public function view(User $user, Payment $payment): bool
    {
        if ((int) $payment->user_id === (int) $user->id) {
            return true;
        }

        $venue = $this->resolveVenueFromPayment($payment);

        return $venue !== null && $this->userBelongsToVenue($user, $venue);
    }

    /**
     * Only the payment owner may upload proof of payment.
     */
    public function uploadProof(User $user, Payment $payment): bool
    {
        return (int) $payment->user_id === (int) $user->id;
    }

    /**
     * Venue owner/staff (or super_admin via Gate::before) may verify.
     */
    public function verify(User $user, Payment $payment): bool
    {
        $venue = $this->resolveVenueFromPayment($payment);

        return $venue !== null && $this->userBelongsToVenue($user, $venue);
    }

    /**
     * Venue owner/staff (or super_admin via Gate::before) may reject.
     */
    public function reject(User $user, Payment $payment): bool
    {
        $venue = $this->resolveVenueFromPayment($payment);

        return $venue !== null && $this->userBelongsToVenue($user, $venue);
    }

    /**
     * Default-deny: payment creation is system-driven (no public endpoint).
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Default-deny: payments are immutable once submitted (verifier uses verify/reject).
     */
    public function update(User $user, Payment $payment): bool
    {
        return false;
    }

    /**
     * Default-deny: payments are not user-deletable.
     */
    public function delete(User $user, Payment $payment): bool
    {
        return false;
    }

    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }

    protected function resolveVenueFromPayment(Payment $payment): ?Venue
    {
        $payable = $payment->payable;

        if ($payable instanceof Booking) {
            return $payable->court?->venue;
        }

        if ($payable instanceof SessionPlayer) {
            return $payable->session?->venue;
        }

        return null;
    }

    protected function userBelongsToVenue(User $user, Venue $venue): bool
    {
        if ((int) $venue->owner_id === (int) $user->id) {
            return true;
        }

        return $venue->staff()->where('user_id', $user->id)->exists();
    }
}
