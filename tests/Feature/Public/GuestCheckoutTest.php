<?php

namespace Tests\Feature\Public;

use App\Enums\BookingStatus;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Payment;
use App\Models\Venue;
use App\Models\VenueOperatingHour;
use App\Models\VenuePaymentMethod;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuestCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Pin "now" so slot calculations don't drift between local runs.
        Carbon::setTestNow(CarbonImmutable::parse('2026-05-04 00:00:00', 'Asia/Manila'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function makeBookableCourt(): Court
    {
        $venue = Venue::factory()->approved()->create([
            'timezone' => 'Asia/Manila',
        ]);

        VenuePaymentMethod::factory()->create([
            'venue_id' => $venue->id,
            'provider' => PaymentProvider::Gcash,
            'account_name' => 'Maria Santos',
            'mobile_number' => '09171234567',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        for ($day = 0; $day < 7; $day++) {
            VenueOperatingHour::factory()->create([
                'venue_id' => $venue->id,
                'day_of_week' => $day,
                'opens_at' => '08:00:00',
                'closes_at' => '22:00:00',
                'is_closed' => false,
            ]);
        }

        return Court::factory()->create([
            'venue_id' => $venue->id,
            'hourly_rate' => 350,
            'slot_minutes' => 60,
            'is_active' => true,
        ]);
    }

    public function test_guest_can_view_the_checkout_page_without_logging_in(): void
    {
        $court = $this->makeBookableCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 10:00:00', 'Asia/Manila');

        $response = $this->get(
            "/checkout?venue={$court->venue_id}&court={$court->id}"
                .'&starts_at='.urlencode($startsAt->toIso8601String())
                .'&slot_count=2',
        );

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('public/checkout')
            ->where('reservation.slot_count', 2)
            ->where('reservation.hours', 2)
            ->where('reservation.total_amount', 700)
            ->where('venue.payment_methods.0.provider', 'gcash')
            ->where('venue.payment_methods.0.account_name', 'Maria Santos')
            ->where('venue.payment_methods.0.mobile_number', '09171234567')
        );
    }

    public function test_guest_can_complete_checkout_with_payment_proof(): void
    {
        Storage::fake('public');

        $court = $this->makeBookableCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 11:00:00', 'Asia/Manila');

        $response = $this->post('/checkout', [
            'court_id' => $court->id,
            'starts_at' => $startsAt->toIso8601String(),
            'slot_count' => 2,
            'guest_name' => 'Juan Dela Cruz',
            'guest_email' => 'juan@example.com',
            'guest_phone' => '09171112222',
            'reference_number' => 'GCASH-XYZ-001',
            'payment_proof' => UploadedFile::fake()->image('proof.png'),
            'notes' => 'Bringing my own paddle.',
        ]);

        $booking = Booking::query()
            ->where('court_id', $court->id)
            ->where('guest_email', 'juan@example.com')
            ->first();

        $this->assertNotNull($booking, 'Guest booking should be created.');
        $response->assertRedirect("/checkout/success/{$booking->id}");

        $this->assertSame(BookingStatus::PendingPayment, $booking->status);
        $this->assertNull($booking->user_id);
        $this->assertSame('Juan Dela Cruz', $booking->guest_name);
        $this->assertSame('09171112222', $booking->guest_phone);
        $this->assertSame('700.00', (string) $booking->total_amount);
        $this->assertSame('Bringing my own paddle.', $booking->notes);

        $payment = Payment::query()
            ->where('payable_type', Booking::class)
            ->where('payable_id', $booking->id)
            ->first();

        $this->assertNotNull($payment);
        $this->assertSame(PaymentStatus::Pending, $payment->status);
        $this->assertSame('GCASH-XYZ-001', $payment->reference_number);
        $this->assertNotNull($payment->proof_image_path);
        Storage::disk('public')->assertExists($payment->proof_image_path);
    }

    public function test_checkout_rejects_taken_slot(): void
    {
        Storage::fake('public');

        $court = $this->makeBookableCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 11:00:00', 'Asia/Manila');

        Booking::factory()->confirmed()->create([
            'court_id' => $court->id,
            'starts_at' => $startsAt->utc(),
            'ends_at' => $startsAt->copy()->addHour()->utc(),
        ]);

        $this->post('/checkout', [
            'court_id' => $court->id,
            'starts_at' => $startsAt->toIso8601String(),
            'slot_count' => 1,
            'guest_name' => 'Late Booker',
            'guest_email' => 'late@example.com',
            'guest_phone' => '09171110000',
            'payment_proof' => UploadedFile::fake()->image('proof.png'),
        ])->assertSessionHasErrors('starts_at');
    }

    public function test_checkout_requires_payment_proof_image(): void
    {
        $court = $this->makeBookableCourt();
        $startsAt = CarbonImmutable::parse('2026-05-05 11:00:00', 'Asia/Manila');

        $this->post('/checkout', [
            'court_id' => $court->id,
            'starts_at' => $startsAt->toIso8601String(),
            'guest_name' => 'No Proof',
            'guest_email' => 'noproof@example.com',
            'guest_phone' => '09171110000',
            // payment_proof intentionally missing
        ])->assertSessionHasErrors('payment_proof');
    }
}
