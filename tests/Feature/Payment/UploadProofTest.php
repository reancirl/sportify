<?php

namespace Tests\Feature\Payment;

use App\Enums\PaymentStatus;
use App\Exceptions\Domain\InvalidPaymentProofException;
use App\Exceptions\Domain\PaymentAlreadyFinalizedException;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadProofTest extends TestCase
{
    use RefreshDatabase;

    private PaymentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->service = app(PaymentService::class);
    }

    public function test_accepts_jpg_image(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        $file = UploadedFile::fake()->image('proof.jpg', 800, 600);

        $updated = $this->service->uploadProof($payment, $file, 'REF-123');

        $this->assertNotNull($updated->proof_image_path);
        $this->assertSame('REF-123', $updated->reference_number);
        $this->assertSame(PaymentStatus::Pending, $updated->status);
        Storage::disk('public')->assertExists($updated->proof_image_path);
    }

    public function test_accepts_png_image(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        $file = UploadedFile::fake()->image('proof.png', 800, 600);

        $updated = $this->service->uploadProof($payment, $file);

        $this->assertNotNull($updated->proof_image_path);
        Storage::disk('public')->assertExists($updated->proof_image_path);
    }

    public function test_accepts_webp_image(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        $file = UploadedFile::fake()->image('proof.webp');

        $updated = $this->service->uploadProof($payment, $file);

        $this->assertNotNull($updated->proof_image_path);
    }

    public function test_rejects_non_image_mime(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        $file = UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf');

        $this->expectException(InvalidPaymentProofException::class);

        $this->service->uploadProof($payment, $file);
    }

    public function test_rejects_files_larger_than_5mb(): void
    {
        $payment = Payment::factory()->pending()->for(Booking::factory(), 'payable')->create();
        // 6MB jpg
        $file = UploadedFile::fake()->create('big.jpg', 6 * 1024, 'image/jpeg');

        $this->expectException(InvalidPaymentProofException::class);

        $this->service->uploadProof($payment, $file);
    }

    public function test_throws_when_payment_already_finalized(): void
    {
        $payment = Payment::factory()->verified()->for(Booking::factory(), 'payable')->create();
        $file = UploadedFile::fake()->image('proof.jpg');

        $this->expectException(PaymentAlreadyFinalizedException::class);

        $this->service->uploadProof($payment, $file);
    }
}
