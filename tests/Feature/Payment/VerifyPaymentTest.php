<?php

namespace Tests\Feature\Payment;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\Domain\PaymentAlreadyVerifiedException;
use App\Exceptions\Domain\PaymentRejectedException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payment\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerifyPaymentTest extends TestCase
{
    use RefreshDatabase;

    private PaymentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(PaymentService::class);
    }

    public function test_verifies_a_pending_payment_and_records_verifier(): void
    {
        $booking = Booking::factory()->pendingPayment()->create();
        $payment = Payment::factory()->pending()->for($booking, 'payable')->create();
        $verifier = User::factory()->create();

        $verified = $this->service->verifyPayment($payment, $verifier);

        $this->assertSame(PaymentStatus::Verified, $verified->status);
        $this->assertSame((int) $verifier->id, (int) $verified->verified_by);
        $this->assertNotNull($verified->verified_at);
    }

    public function test_flips_related_booking_to_confirmed(): void
    {
        $booking = Booking::factory()->pendingPayment()->create();
        $payment = Payment::factory()->pending()->for($booking, 'payable')->create();
        $verifier = User::factory()->create();

        $this->service->verifyPayment($payment, $verifier);

        $booking->refresh();
        $this->assertSame(BookingStatus::Confirmed, $booking->status);
    }

    public function test_throws_when_payment_already_verified(): void
    {
        $payment = Payment::factory()->verified()->for(Booking::factory(), 'payable')->create();
        $verifier = User::factory()->create();

        $this->expectException(PaymentAlreadyVerifiedException::class);

        $this->service->verifyPayment($payment, $verifier);
    }

    public function test_throws_when_payment_was_rejected(): void
    {
        $payment = Payment::factory()->rejected()->for(Booking::factory(), 'payable')->create();
        $verifier = User::factory()->create();

        $this->expectException(PaymentRejectedException::class);

        $this->service->verifyPayment($payment, $verifier);
    }
}
