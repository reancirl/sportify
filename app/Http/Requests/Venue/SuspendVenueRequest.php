<?php

namespace App\Http\Requests\Venue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SuspendVenueRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@suspend via the route's
     * resolved {venue} parameter (super_admin only via Gate::before).
     */
    public function authorize(): bool
    {
        $venue = $this->route('venue');

        return $venue !== null && ($this->user()?->can('suspend', $venue) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'suspension_reason' => ['required', 'string', 'max:500'],
        ];
    }
}
