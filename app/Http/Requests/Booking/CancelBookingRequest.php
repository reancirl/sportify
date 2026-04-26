<?php

namespace App\Http\Requests\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    /**
     * Authorization is delegated to BookingPolicy@cancel via the route's
     * resolved {booking} parameter.
     */
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $booking !== null && ($this->user()?->can('cancel', $booking) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cancellation_reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
