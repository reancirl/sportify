<?php

namespace App\Http\Requests\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RejectPaymentRequest extends FormRequest
{
    /**
     * Authorization is delegated to PaymentPolicy@reject via the route's
     * resolved {payment} parameter.
     */
    public function authorize(): bool
    {
        $payment = $this->route('payment');

        return $payment !== null && ($this->user()?->can('reject', $payment) ?? false);
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
