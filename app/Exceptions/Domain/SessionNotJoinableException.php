<?php

namespace App\Exceptions\Domain;

use App\Enums\SessionStatus;
use DomainException;

class SessionNotJoinableException extends DomainException
{
    public function __construct(public readonly SessionStatus $currentStatus, ?string $message = null)
    {
        parent::__construct($message ?? "This session cannot be joined while it is {$currentStatus->label()}.");
    }
}
