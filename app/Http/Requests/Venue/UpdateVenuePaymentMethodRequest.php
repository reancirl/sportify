<?php

namespace App\Http\Requests\Venue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVenuePaymentMethodRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePaymentMethodPolicy@update.
     */
    public function authorize(): bool
    {
        $paymentMethod = $this->route('paymentMethod');

        return $paymentMethod !== null && ($this->user()?->can('update', $paymentMethod) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // provider is intentionally excluded — delete + re-create to change provider
            'account_name' => ['required', 'string', 'max:120'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
