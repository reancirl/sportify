<?php

namespace App\Exceptions\Domain;

use DomainException;

class SessionFullException extends DomainException
{
    public function __construct(public readonly int $maxPlayers, ?string $message = null)
    {
        parent::__construct($message ?? 'This open play session is already full.');
    }
}
