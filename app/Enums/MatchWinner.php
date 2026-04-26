<?php

namespace App\Enums;

enum MatchWinner: string
{
    case TeamA = 'team_a';
    case TeamB = 'team_b';
    case Draw = 'draw';

    public function label(): string
    {
        return match ($this) {
            self::TeamA => 'Team A',
            self::TeamB => 'Team B',
            self::Draw => 'Draw',
        };
    }
}
