<?php

namespace App\Exceptions\Domain;

use DomainException;

class AlreadyJoinedSessionException extends DomainException
{
    public function __construct(?string $message = null)
    {
        parent::__construct($message ?? 'You have already joined this session.');
    }
}
