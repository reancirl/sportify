<?php

namespace App\Services\Venue;

use App\Enums\VenueStatus;
use App\Exceptions\Domain\VenueAlreadyApprovedException;
use App\Models\User;
use App\Models\Venue;
use Carbon\CarbonImmutable;
use DomainException;

class VenueApprovalService
{
    /**
     * Approve a venue. Works from pending, rejected, or suspended.
     *
     * @throws VenueAlreadyApprovedException
     */
    public function approve(Venue $venue, User $approver): Venue
    {
        if ($venue->status === VenueStatus::Approved) {
            throw new VenueAlreadyApprovedException;
        }

        $venue->forceFill([
            'status' => VenueStatus::Approved,
            'approved_at' => CarbonImmutable::now('UTC'),
            'approved_by' => $approver->id,
            'rejection_reason' => null,
        ])->save();

        return $venue->refresh();
    }

    /**
     * Reject a pending venue with a reason.
     *
     * @throws VenueAlreadyApprovedException
     */
    public function reject(Venue $venue, User $approver, string $reason): Venue
    {
        if ($venue->status === VenueStatus::Approved) {
            throw new VenueAlreadyApprovedException;
        }

        $venue->forceFill([
            'status' => VenueStatus::Rejected,
            'approved_by' => $approver->id,
            'rejection_reason' => $reason,
        ])->save();

        return $venue->refresh();
    }

    /**
     * Suspend an approved venue with a reason. The reason is stored in
     * `rejection_reason` — we treat that column as a generic "status reason"
     * since rejections and suspensions are mutually exclusive states.
     *
     * @throws DomainException when the venue is not currently approved.
     */
    public function suspend(Venue $venue, User $admin, string $reason): Venue
    {
        if ($venue->status !== VenueStatus::Approved) {
            throw new DomainException('Only approved venues can be suspended.');
        }

        $venue->forceFill([
            'status' => VenueStatus::Suspended,
            'approved_by' => $admin->id,
            'rejection_reason' => $reason,
        ])->save();

        return $venue->refresh();
    }

    /**
     * Move a suspended venue back to approved.
     *
     * @throws DomainException when the venue is not currently suspended.
     */
    public function reinstate(Venue $venue, User $admin): Venue
    {
        if ($venue->status !== VenueStatus::Suspended) {
            throw new DomainException('Only suspended venues can be reinstated.');
        }

        $venue->forceFill([
            'status' => VenueStatus::Approved,
            'approved_at' => CarbonImmutable::now('UTC'),
            'approved_by' => $admin->id,
            'rejection_reason' => null,
        ])->save();

        return $venue->refresh();
    }
}
