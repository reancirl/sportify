<?php

namespace App\Http\Resources;

use App\Models\VenueOperatingHour;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VenueOperatingHour
 */
class VenueOperatingHourResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'venue_id' => $this->venue_id,
            'day_of_week' => (int) $this->day_of_week,
            'opens_at' => $this->opens_at,
            'closes_at' => $this->closes_at,
            'is_closed' => (bool) $this->is_closed,
        ];
    }
}
