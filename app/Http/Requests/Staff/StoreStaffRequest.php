<?php

namespace App\Http\Requests\Staff;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@update via the route's
     * resolved {venue} parameter (only venue owner/manager may add staff).
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
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', 'string', 'in:owner,manager,staff'],
        ];
    }
}
