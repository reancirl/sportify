<?php

namespace App\Http\Requests\OpenPlay;

use App\Models\Venue;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreOpenPlaySessionRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@update via the route's
     * resolved {venue} parameter (only venue staff/owner may schedule sessions).
     */
    public function authorize(): bool
    {
        $venue = $this->route('venue');

        return $venue !== null && ($this->user()?->can('update', $venue) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'max_players' => ['required', 'integer', 'min:2', 'max:64'],
            'min_skill_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,pro'],
            'max_skill_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,pro'],
            'fee_per_player' => ['required', 'numeric', 'min:0'],
            'court_ids' => ['required', 'array', 'min:1'],
            'court_ids.*' => ['uuid', 'exists:courts,id'],
        ];
    }

    /**
     * Ensure every supplied court belongs to the venue resolved on the route.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $venue = $this->route('venue');

            if (! $venue instanceof Venue) {
                return;
            }

            $courtIds = $this->input('court_ids', []);

            if (! is_array($courtIds) || $courtIds === []) {
                return;
            }

            $venueCourtIds = $venue->courts()->pluck('id')->all();

            foreach ($courtIds as $index => $courtId) {
                if (! in_array($courtId, $venueCourtIds, true)) {
                    $validator->errors()->add(
                        "court_ids.{$index}",
                        'The selected court does not belong to this venue.',
                    );
                }
            }
        });
    }
}
