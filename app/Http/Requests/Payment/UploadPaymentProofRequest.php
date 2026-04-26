<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
{
    /**
     * Authorization is delegated to PaymentPolicy@uploadProof via the route's
     * resolved {payment} parameter.
     */
    public function authorize(): bool
    {
        $payment = $this->route('payment');

        return $payment !== null && ($this->user()?->can('uploadProof', $payment) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'reference_number' => ['nullable', 'string', 'max:64'],
        ];
    }
}
