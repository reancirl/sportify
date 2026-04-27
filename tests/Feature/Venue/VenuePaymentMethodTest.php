<?php

namespace Tests\Feature\Venue;

use App\Enums\PaymentProvider;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenuePaymentMethod;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenuePaymentMethodTest extends TestCase
{
    use RefreshDatabase;

    private function makeOwnedVenue(): array
    {
        $this->seed(RoleSeeder::class);

        $owner = User::factory()->create();
        $owner->assignRole('venue_owner');

        $venue = Venue::factory()->approved()->create([
            'owner_id' => $owner->id,
        ]);

        return [$owner, $venue];
    }

    public function test_owner_can_view_payment_methods_index(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Gcash,
        ]);

        $this->actingAs($owner)
            ->get("/venue-admin/venues/{$venue->id}/payment-methods")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('venue-admin/payment-methods/index')
                ->has('paymentMethods.data', 1)
                ->has('providers', 2),
            );
    }

    public function test_owner_can_add_a_gcash_method(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        $this->actingAs($owner)
            ->post("/venue-admin/venues/{$venue->id}/payment-methods", [
                'provider' => PaymentProvider::Gcash->value,
                'account_name' => 'Maria Santos',
                'mobile_number' => '09171234567',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('venue_payment_methods', [
            'venue_id' => $venue->id,
            'provider' => 'gcash',
            'account_name' => 'Maria Santos',
            'mobile_number' => '09171234567',
            'is_active' => true,
        ]);
    }

    public function test_owner_can_add_a_maya_method_alongside_gcash(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Gcash,
        ]);

        $this->actingAs($owner)
            ->post("/venue-admin/venues/{$venue->id}/payment-methods", [
                'provider' => PaymentProvider::Maya->value,
                'account_name' => 'Maria Santos',
                'mobile_number' => '09171234567',
            ])
            ->assertRedirect();

        $this->assertSame(2, $venue->paymentMethods()->count());
    }

    public function test_duplicate_provider_for_same_venue_is_rejected(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Gcash,
        ]);

        $this->actingAs($owner)
            ->post("/venue-admin/venues/{$venue->id}/payment-methods", [
                'provider' => PaymentProvider::Gcash->value,
                'account_name' => 'Another Account',
                'mobile_number' => '09175550000',
            ])
            ->assertSessionHasErrors('provider');

        $this->assertSame(1, $venue->paymentMethods()->count());
    }

    public function test_owner_can_update_account_details(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        $method = VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Gcash,
            'account_name' => 'Old Name',
            'mobile_number' => '09170000000',
        ]);

        $this->actingAs($owner)
            ->patch("/venue-admin/venues/{$venue->id}/payment-methods/{$method->id}", [
                'account_name' => 'New Name',
                'mobile_number' => '09179999999',
                'is_active' => false,
            ])
            ->assertRedirect();

        $method->refresh();
        $this->assertSame('New Name', $method->account_name);
        $this->assertSame('09179999999', $method->mobile_number);
        $this->assertFalse($method->is_active);
    }

    public function test_owner_can_delete_a_payment_method(): void
    {
        [$owner, $venue] = $this->makeOwnedVenue();

        $method = VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Maya,
        ]);

        $this->actingAs($owner)
            ->delete("/venue-admin/venues/{$venue->id}/payment-methods/{$method->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('venue_payment_methods', ['id' => $method->id]);
    }

    public function test_other_user_cannot_manage_methods(): void
    {
        [, $venue] = $this->makeOwnedVenue();

        $stranger = User::factory()->create();
        $stranger->assignRole('venue_owner');

        $this->actingAs($stranger)
            ->get("/venue-admin/venues/{$venue->id}/payment-methods")
            ->assertForbidden();

        $this->actingAs($stranger)
            ->post("/venue-admin/venues/{$venue->id}/payment-methods", [
                'provider' => PaymentProvider::Gcash->value,
                'account_name' => 'Hijack',
                'mobile_number' => '09170000000',
            ])
            ->assertForbidden();
    }
}
