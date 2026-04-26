<?php

namespace App\Http\Requests\Venue;

use App\Enums\Amenity;
use App\Enums\CourtSurfaceType;
use App\Models\Venue;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVenueRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@create.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Venue::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Step 1 — Basic info
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', Rule::in(array_column(Amenity::cases(), 'value'))],
            'advance_booking_weeks' => ['nullable', 'integer', 'min:1', 'max:52'],

            // Step 2 — Location
            'address_line' => ['required', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:80'],
            'province' => ['required', 'string', 'max:80'],
            'region' => ['required', 'string', 'max:80'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'google_maps_url' => ['nullable', 'url', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Step 3 — Contact
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'gcash_account_name' => ['nullable', 'string', 'max:120'],
            'gcash_mobile_number' => ['nullable', 'string', 'max:20'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'twitter_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
            'website_url' => ['nullable', 'url', 'max:255'],

            // Misc
            'timezone' => ['nullable', 'string', 'max:64'],

            // Step 4 — Courts created in the same submission
            'courts' => ['required', 'array', 'min:1', 'max:20'],
            'courts.*.name' => ['required', 'string', 'max:80'],
            'courts.*.surface_type' => [
                'nullable',
                'string',
                Rule::in(array_column(CourtSurfaceType::cases(), 'value')),
            ],
            'courts.*.hourly_rate' => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'courts.*.slot_minutes' => ['nullable', 'integer', 'in:30,45,60,90,120'],
            'courts.*.is_active' => ['nullable', 'boolean'],
        ];
    }
}
