<?php

namespace App\Http\Resources;

use App\Models\SessionPlayer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SessionPlayer
 */
class SessionPlayerResource extends JsonResource
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
            'session_id' => $this->session_id,
            'user_id' => $this->user_id,
            'joined_at' => $this->joined_at?->utc()->toIso8601String(),
            'status' => $this->status->value,
            'payment_id' => $this->payment_id,
            'session' => OpenPlaySessionResource::make($this->whenLoaded('session')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'payment' => PaymentResource::make($this->whenLoaded('payment')),
        ];
    }
}
