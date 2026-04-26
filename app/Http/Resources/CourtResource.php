<?php

namespace App\Http\Resources;

use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Court
 */
class CourtResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'hourly_rate' => (string) $this->hourly_rate,
            'slot_minutes' => (int) $this->slot_minutes,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
            'deleted_at' => $this->deleted_at?->utc()->toIso8601String(),
            'venue' => VenueResource::make($this->whenLoaded('venue')),
            'bookings' => BookingResource::collection($this->whenLoaded('bookings')),
        ];
    }
}
