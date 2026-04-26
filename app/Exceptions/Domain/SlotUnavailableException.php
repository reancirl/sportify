<?php

namespace App\Exceptions\Domain;

use Carbon\CarbonInterface;
use DomainException;

class SlotUnavailableException extends DomainException
{
    public function __construct(public readonly CarbonInterface $requestedStartsAt, ?string $message = null)
    {
        parent::__construct($message ?? 'The requested slot is no longer available.');
    }
}
