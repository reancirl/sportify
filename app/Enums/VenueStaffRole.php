<?php

namespace App\Enums;

enum VenueStaffRole: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Owner',
            self::Manager => 'Manager',
            self::Staff => 'Staff',
        };
    }
}
