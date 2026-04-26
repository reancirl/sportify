<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGuestCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'court_id' => ['required', 'uuid', 'exists:courts,id'],
            'starts_at' => ['required', 'date'],
            'slot_count' => ['nullable', 'integer', 'min:1', 'max:12'],

            'guest_name' => ['required', 'string', 'max:120'],
            'guest_email' => ['required', 'email', 'max:160'],
            'guest_phone' => ['required', 'string', 'max:32'],

            'reference_number' => ['nullable', 'string', 'max:64'],
            'payment_proof' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120', // 5 MB
            ],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
