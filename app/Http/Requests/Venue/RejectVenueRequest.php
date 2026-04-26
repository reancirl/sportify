<?php

namespace App\Http\Requests\Venue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RejectVenueRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@reject via the route's
     * resolved {venue} parameter (super_admin only via Gate::before).
     */
    public function authorize(): bool
    {
        $venue = $this->route('venue');

        return $venue !== null && ($this->user()?->can('reject', $venue) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'max:500'],
        ];
    }
}
