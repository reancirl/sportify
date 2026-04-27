<?php

namespace App\Http\Requests\Venue;

use App\Enums\PaymentProvider;
use App\Models\VenuePaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVenuePaymentMethodRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePaymentMethodPolicy@create.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', [VenuePaymentMethod::class, $this->route('venue')]) ?? false;
    }

    /**
     * Normalize missing is_active to true before validation.
     */
    public function prepareForValidation(): void
    {
        if (! $this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', Rule::enum(PaymentProvider::class)],
            'account_name' => ['required', 'string', 'max:120'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
