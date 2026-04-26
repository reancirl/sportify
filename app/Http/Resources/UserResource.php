<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_path' => $this->avatar_path,
            'skill_level' => $this->skill_level?->value,
            'elo_rating' => $this->elo_rating,
            'is_active' => (bool) $this->is_active,
            'roles' => $this->getRoleNames()->all(),
            'created_at' => $this->created_at?->utc()->toIso8601String(),
        ];
    }
}
