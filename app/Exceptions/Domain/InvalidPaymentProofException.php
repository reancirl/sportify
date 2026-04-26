<?php

namespace App\Exceptions\Domain;

use DomainException;

class InvalidPaymentProofException extends DomainException
{
    public function __construct(public readonly string $reason, ?string $message = null)
    {
        parent::__construct($message ?? $reason);
    }
}
