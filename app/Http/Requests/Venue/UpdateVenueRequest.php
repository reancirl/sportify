<?php

namespace App\Http\Requests\Venue;

use App\Enums\Amenity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVenueRequest extends FormRequest
{
    /**
     * Authorization is delegated to VenuePolicy@update via the route's
     * resolved {venue} parameter.
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
            // Basic info
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', Rule::in(array_column(Amenity::cases(), 'value'))],
            'advance_booking_weeks' => ['nullable', 'integer', 'min:1', 'max:52'],

            // Location
            'address_line' => ['required', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:80'],
            'province' => ['required', 'string', 'max:80'],
            'region' => ['required', 'string', 'max:80'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'google_maps_url' => ['nullable', 'url', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Contact
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'gcash_account_name' => ['nullable', 'string', 'max:120'],
            'gcash_mobile_number' => ['nullable', 'string', 'max:20'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'twitter_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
            'website_url' => ['nullable', 'url', 'max:255'],

            'timezone' => ['nullable', 'string', 'max:64'],
        ];
    }
}
