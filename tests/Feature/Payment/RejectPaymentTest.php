<?php

namespace Tests\Feature\Payment;

use App\Enums\PaymentStatus;
use App\Exceptions\Domain\PaymentAlreadyVerifiedException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payment\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RejectPaymentTest extends TestCase
{
    use RefreshDatabase;

    private PaymentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(PaymentService::class);
    }

    public function test_rejects_pending_payment_with_reason(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        $verifier = User::factory()->create();

        $rejected = $this->service->rejectPayment($payment, $verifier, 'Blurry screenshot.');

        $this->assertSame(PaymentStatus::Rejected, $rejected->status);
        $this->assertSame('Blurry screenshot.', $rejected->rejection_reason);
        $this->assertSame((int) $verifier->id, (int) $rejected->verified_by);
        $this->assertNotNull($rejected->verified_at);
    }

    public function test_throws_when_payment_already_verified(): void
    {
        $payment = Payment::factory()->verified()->for(Booking::factory(), 'payable')->create();
        $verifier = User::factory()->create();

        $this->expectException(PaymentAlreadyVerifiedException::class);

        $this->service->rejectPayment($payment, $verifier, 'Late.');
    }
}
