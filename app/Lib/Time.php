<?php

namespace App\Lib;

use Carbon\CarbonInterface;

class Time
{
    public static function displayManila(?CarbonInterface $dt, string $format = 'M j, Y g:i A'): string
    {
        if (!$dt) {
            return '';
        }

        return $dt->copy()->setTimezone('Asia/Manila')->format($format);
    }
}
