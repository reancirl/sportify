<?php

namespace App\Http\Resources;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Venue
 */
class VenueResource extends JsonResource
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
            'owner_id' => $this->owner_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address_line' => $this->address_line,
            'city' => $this->city,
            'province' => $this->province,
            'region' => $this->region,
            'latitude' => $this->latitude !== null ? (string) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (string) $this->longitude : null,
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,
            'cover_image_path' => $this->cover_image_path,
            'timezone' => $this->timezone,
            'status' => $this->status->value,
            'approved_at' => $this->approved_at?->utc()->toIso8601String(),
            'approved_by' => $this->approved_by,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
            'deleted_at' => $this->deleted_at?->utc()->toIso8601String(),
            'owner' => UserResource::make($this->whenLoaded('owner')),
            'courts' => CourtResource::collection($this->whenLoaded('courts')),
            'images' => VenueImageResource::collection($this->whenLoaded('images')),
            'operating_hours' => VenueOperatingHourResource::collection($this->whenLoaded('operatingHours')),
            'staff_members' => VenueStaffMemberResource::collection($this->whenLoaded('staff')),
        ];
    }
}
