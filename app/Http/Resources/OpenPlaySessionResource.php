<?php

namespace App\Http\Resources;

use App\Models\OpenPlaySession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OpenPlaySession
 */
class OpenPlaySessionResource extends JsonResource
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
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'starts_at' => $this->starts_at?->utc()->toIso8601String(),
            'ends_at' => $this->ends_at?->utc()->toIso8601String(),
            'max_players' => (int) $this->max_players,
            'min_skill_level' => $this->min_skill_level?->value,
            'max_skill_level' => $this->max_skill_level?->value,
            'fee_per_player' => (string) $this->fee_per_player,
            'court_ids' => array_values((array) ($this->court_ids ?? [])),
            'status' => $this->status->value,
            'players_count' => $this->whenCounted('players'),
            'created_at' => $this->created_at?->utc()->toIso8601String(),
            'updated_at' => $this->updated_at?->utc()->toIso8601String(),
            'venue' => VenueResource::make($this->whenLoaded('venue')),
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'players' => SessionPlayerResource::collection($this->whenLoaded('players')),
        ];
    }
}
