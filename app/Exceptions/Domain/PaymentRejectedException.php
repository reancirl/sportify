<?php

namespace App\Exceptions\Domain;

use DomainException;

class PaymentRejectedException extends DomainException
{
    public function __construct(?string $message = null)
    {
        parent::__construct($message ?? 'This payment has been rejected and cannot be re-verified.');
    }
}
