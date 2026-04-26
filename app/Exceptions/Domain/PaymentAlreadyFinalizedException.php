<?php

namespace App\Exceptions\Domain;

use DomainException;

class PaymentAlreadyFinalizedException extends DomainException
{
    public function __construct(?string $message = null)
    {
        parent::__construct($message ?? 'This payment has already been finalized and cannot be modified.');
    }
}
