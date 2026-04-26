<?php

namespace App\Exceptions\Domain;

use DomainException;

class VenueAlreadyApprovedException extends DomainException
{
    public function __construct(?string $message = null)
    {
        parent::__construct($message ?? 'This venue has already been approved.');
    }
}
