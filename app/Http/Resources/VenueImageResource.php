<?php

namespace App\Http\Resources;

use App\Models\VenueImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VenueImage
 */
class VenueImageResource extends JsonResource
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
            'image_path' => $this->image_path,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
