<?php

namespace App\Http\Resources;

use App\Models\VenueStaffMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VenueStaffMember
 */
class VenueStaffMemberResource extends JsonResource
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
            'user_id' => $this->user_id,
            'role' => $this->role->value,
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
