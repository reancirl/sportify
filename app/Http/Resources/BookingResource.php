<?php

namespace App\Http\Resources;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Booking
 */
class BookingResource extends JsonResource
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
            'court_id' => $this->court_id,
            'user_id' => $this->user_id,
            'starts_at' => $this->starts_at?->utc()->toIso8601String(),
            'ends_at' => $this->ends_at?->utc()->toIso8601String(),
            'total_amount' => (string) $this->total_amount,
            'status' => $this->status->value,
            'cancellation_reason' => $this->cancellation_reason,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
            'court' => CourtResource::make($this->whenLoaded('court')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'payment' => PaymentResource::make($this->whenLoaded('payment')),
        ];
    }
}
