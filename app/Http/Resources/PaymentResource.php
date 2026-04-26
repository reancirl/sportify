<?php

namespace App\Http\Resources;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\SessionPlayer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
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
            'payable_type' => $this->payable_type,
            'payable_id' => $this->payable_id,
            'user_id' => $this->user_id,
            'amount' => (string) $this->amount,
            'proof_image_path' => $this->proof_image_path,
            'proof_url' => $this->proof_url,
            'reference_number' => $this->reference_number,
            'status' => $this->status->value,
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at?->utc()->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'verifier' => UserResource::make($this->whenLoaded('verifier')),
            'payable' => $this->when(
                $this->relationLoaded('payable'),
                fn () => $this->payable instanceof Booking
                    ? BookingResource::make($this->payable)
                    : ($this->payable instanceof SessionPlayer
                        ? SessionPlayerResource::make($this->payable)
                        : null),
            ),
        ];
    }
}
