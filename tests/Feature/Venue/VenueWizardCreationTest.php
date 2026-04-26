<?php

namespace Tests\Feature\Venue;

use App\Enums\Amenity;
use App\Enums\CourtSurfaceType;
use App\Enums\VenueStatus;
use App\Models\User;
use App\Models\Venue;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenueWizardCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_venue_with_courts_in_one_submission(): void
    {
        $this->seed(RoleSeeder::class);

        $owner = User::factory()->create();
        $owner->assignRole('venue_owner');

        $payload = [
            // Basic
            'name' => 'Pala-o Pickleball Club',
            'description' => 'Premium courts in Pala-o.',
            'amenities' => [
                Amenity::AirConditioning->value,
                Amenity::ShowerFacilities->value,
                Amenity::Parking->value,
            ],
            'advance_booking_weeks' => 6,

            // Location
            'address_line' => 'Macapagal Avenue',
            'barangay' => 'Pala-o',
            'city' => 'Iligan City',
            'province' => 'Lanao del Norte',
            'region' => 'Northern Mindanao',
            'postal_code' => '9200',
            'google_maps_url' => 'https://maps.google.com/test',

            // Contact
            'contact_email' => 'club@palao.test',
            'contact_phone' => '+639175550011',
            'facebook_url' => 'https://facebook.com/palao',
            'instagram_url' => 'https://instagram.com/palao',

            // Courts
            'courts' => [
                [
                    'name' => 'Court 1',
                    'surface_type' => CourtSurfaceType::Indoor->value,
                    'hourly_rate' => 350,
                    'slot_minutes' => 60,
                    'is_active' => true,
                ],
                [
                    'name' => 'Court 2',
                    'surface_type' => CourtSurfaceType::Covered->value,
                    'hourly_rate' => 400,
                    'slot_minutes' => 60,
                    'is_active' => true,
                ],
            ],
        ];

        $response = $this->actingAs($owner)
            ->post('/venue-admin/venues', $payload);

        $venue = Venue::query()->where('name', 'Pala-o Pickleball Club')->first();

        $this->assertNotNull($venue, 'Venue should be created.');
        $response->assertRedirect("/venue-admin/venues/{$venue->id}/edit");

        $this->assertSame(VenueStatus::Pending, $venue->status);
        $this->assertSame((int) $owner->id, (int) $venue->owner_id);
        $this->assertSame('Pala-o', $venue->barangay);
        $this->assertSame('9200', $venue->postal_code);
        $this->assertSame(6, $venue->advance_booking_weeks);
        $this->assertEqualsCanonicalizing(
            [
                Amenity::AirConditioning->value,
                Amenity::ShowerFacilities->value,
                Amenity::Parking->value,
            ],
            $venue->amenities,
        );
        $this->assertSame('https://facebook.com/palao', $venue->facebook_url);

        $this->assertCount(2, $venue->courts);
        $this->assertSame('Court 1', $venue->courts[0]->name);
        $this->assertSame(CourtSurfaceType::Indoor, $venue->courts[0]->surface_type);
        $this->assertSame('350.00', (string) $venue->courts[0]->hourly_rate);
    }

    public function test_creation_fails_without_courts(): void
    {
        $this->seed(RoleSeeder::class);

        $owner = User::factory()->create();
        $owner->assignRole('venue_owner');

        $response = $this->actingAs($owner)
            ->from('/venue-admin/venues/create')
            ->post('/venue-admin/venues', [
                'name' => 'Bad Venue',
                'address_line' => 'Somewhere',
                'city' => 'Iligan City',
                'province' => 'Lanao del Norte',
                'region' => 'Northern Mindanao',
                'courts' => [],
            ]);

        $response->assertSessionHasErrors('courts');
        $this->assertDatabaseMissing('venues', ['name' => 'Bad Venue']);
    }

    public function test_creation_fails_with_invalid_amenity_value(): void
    {
        $this->seed(RoleSeeder::class);

        $owner = User::factory()->create();
        $owner->assignRole('venue_owner');

        $response = $this->actingAs($owner)
            ->from('/venue-admin/venues/create')
            ->post('/venue-admin/venues', [
                'name' => 'Bad Amenity Venue',
                'address_line' => 'Somewhere',
                'city' => 'Iligan City',
                'province' => 'Lanao del Norte',
                'region' => 'Northern Mindanao',
                'amenities' => ['hot_tub_with_dolphins'],
                'courts' => [
                    [
                        'name' => 'Court 1',
                        'hourly_rate' => 300,
                    ],
                ],
            ]);

        $response->assertSessionHasErrors('amenities.0');
    }
}
