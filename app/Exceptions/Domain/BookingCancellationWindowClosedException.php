<?php

namespace App\Exceptions\Domain;

use Carbon\CarbonInterface;
use DomainException;

class BookingCancellationWindowClosedException extends DomainException
{
    public function __construct(public readonly CarbonInterface $startsAt, ?string $message = null)
    {
        parent::__construct($message ?? 'The booking can no longer be cancelled by the player.');
    }
}
