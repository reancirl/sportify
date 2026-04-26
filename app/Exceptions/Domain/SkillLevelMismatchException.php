<?php

namespace App\Exceptions\Domain;

use App\Enums\SkillLevel;
use DomainException;

class SkillLevelMismatchException extends DomainException
{
    public function __construct(
        public readonly ?SkillLevel $userLevel,
        public readonly ?SkillLevel $minRequired,
        public readonly ?SkillLevel $maxAllowed,
        ?string $message = null,
    ) {
        parent::__construct($message ?? 'Your skill level does not match the requirements for this session.');
    }
}
