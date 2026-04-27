<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case Gcash = 'gcash';
    case Maya = 'maya';

    public function label(): string
    {
        return match ($this) {
            self::Gcash => 'GCash',
            self::Maya => 'Maya',
        };
    }
}
