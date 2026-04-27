<?php

namespace App\Http\Resources;

use App\Models\VenuePaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VenuePaymentMethod
 */
class VenuePaymentMethodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'venue_id' => (string) $this->venue_id,
            'provider' => $this->provider->value,
            'provider_label' => $this->provider->label(),
            'account_name' => $this->account_name,
            'mobile_number' => $this->mobile_number,
            'qr_code_path' => $this->qr_code_path,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
        ];
    }
}
