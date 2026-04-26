<?php

namespace App\Enums;

enum CourtSurfaceType: string
{
    case Covered = 'covered';
    case Outdoor = 'outdoor';
    case Indoor = 'indoor';
    case Hard = 'hard';
    case Clay = 'clay';
    case Grass = 'grass';
    case Synthetic = 'synthetic';

    public function label(): string
    {
        return match ($this) {
            self::Covered => 'Covered',
            self::Outdoor => 'Outdoor',
            self::Indoor => 'Indoor',
            self::Hard => 'Hard court',
            self::Clay => 'Clay',
            self::Grass => 'Grass',
            self::Synthetic => 'Synthetic',
        };
    }
}
