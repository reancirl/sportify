<?php

namespace App\Enums;

enum SessionPlayerStatus: string
{
    case Registered = 'registered';
    case CheckedIn = 'checked_in';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Registered',
            self::CheckedIn => 'Checked In',
            self::Cancelled => 'Cancelled',
            self::NoShow => 'No Show',
        };
    }
}
