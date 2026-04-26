<?php

namespace App\Http\Requests\Court;

use App\Enums\CourtSurfaceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@update via the route's
     * resolved {venue} parameter (courts inherit the venue's update policy).
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
            'name' => ['required', 'string', 'max:80'],
            'surface_type' => [
                'nullable',
                'string',
                Rule::in(array_column(CourtSurfaceType::cases(), 'value')),
            ],
            'description' => ['nullable', 'string'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'slot_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
