<?php

namespace App\Http\Requests\Booking;

use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Authorization is delegated to BookingPolicy@create.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Booking::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'court_id' => ['required', 'uuid', 'exists:courts,id'],
            'starts_at' => ['required', 'date'],
            // How many consecutive slots (defined by court.slot_minutes) to book.
            // 1 = one slot, 4 = four consecutive slots.
            'slot_count' => ['nullable', 'integer', 'min:1', 'max:12'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
