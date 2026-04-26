<?php

namespace App\Services\Payment;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\Domain\InvalidPaymentProofException;
use App\Exceptions\Domain\PaymentAlreadyFinalizedException;
use App\Exceptions\Domain\PaymentAlreadyVerifiedException;
use App\Exceptions\Domain\PaymentRejectedException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\UploadedFile;

class PaymentService
{
    public const MAX_PROOF_BYTES = 5 * 1024 * 1024;

    /** @var array<int, string> */
    public const ALLOWED_PROOF_MIMES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
    ];

    public const PROOF_DISK = 'public';

    public function __construct(
        private readonly ConnectionInterface $db,
        private readonly FilesystemFactory $filesystem,
    ) {}

    /**
     * Validate and persist a payment proof image for the given pending payment.
     *
     * @throws InvalidPaymentProofException
     * @throws PaymentAlreadyFinalizedException
     */
    public function uploadProof(Payment $payment, UploadedFile $file, ?string $reference = null): Payment
    {
        if ($payment->status !== PaymentStatus::Pending) {
            throw new PaymentAlreadyFinalizedException;
        }

        $mime = $file->getMimeType();
        if (! in_array($mime, self::ALLOWED_PROOF_MIMES, true)) {
            throw new InvalidPaymentProofException("Unsupported mime type: {$mime}");
        }

        $size = $file->getSize();
        if ($size === false || $size > self::MAX_PROOF_BYTES) {
            throw new InvalidPaymentProofException('Payment proof exceeds the 5MB size limit.');
        }

        $now = CarbonImmutable::now('UTC');
        $directory = sprintf('payment-proofs/%s/%s', $now->format('Y'), $now->format('m'));

        $path = $file->store($directory, ['disk' => self::PROOF_DISK]);

        if ($path === false) {
            throw new InvalidPaymentProofException('Unable to store payment proof.');
        }

        $payment->forceFill([
            'proof_image_path' => $path,
            'reference_number' => $reference,
        ])->save();

        return $payment->refresh();
    }

    /**
     * Verify a pending payment and propagate the side effect to the payable.
     *
     * @throws PaymentAlreadyVerifiedException
     * @throws PaymentRejectedException
     */
    public function verifyPayment(Payment $payment, User $verifier): Payment
    {
        return $this->db->transaction(function () use ($payment, $verifier): Payment {
            /** @var Payment|null $locked */
            $locked = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->first();

            if ($locked === null) {
                throw new PaymentAlreadyVerifiedException('Payment no longer exists.');
            }

            if ($locked->status === PaymentStatus::Verified) {
                throw new PaymentAlreadyVerifiedException;
            }

            if ($locked->status === PaymentStatus::Rejected) {
                throw new PaymentRejectedException;
            }

            $locked->forceFill([
                'status' => PaymentStatus::Verified,
                'verified_by' => $verifier->id,
                'verified_at' => CarbonImmutable::now('UTC'),
                'rejection_reason' => null,
            ])->save();

            $payable = $locked->payable()->first();

            if ($payable instanceof Booking && $payable->status === BookingStatus::PendingPayment) {
                $payable->forceFill(['status' => BookingStatus::Confirmed])->save();
            }

            return $locked->refresh();
        });
    }

    /**
     * Reject a pending payment with a reason.
     *
     * @throws PaymentAlreadyVerifiedException
     */
    public function rejectPayment(Payment $payment, User $verifier, string $reason): Payment
    {
        return $this->db->transaction(function () use ($payment, $verifier, $reason): Payment {
            /** @var Payment|null $locked */
            $locked = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->first();

            if ($locked === null) {
                throw new PaymentAlreadyVerifiedException('Payment no longer exists.');
            }

            if ($locked->status === PaymentStatus::Verified) {
                throw new PaymentAlreadyVerifiedException;
            }

            $locked->forceFill([
                'status' => PaymentStatus::Rejected,
                'verified_by' => $verifier->id,
                'verified_at' => CarbonImmutable::now('UTC'),
                'rejection_reason' => $reason,
            ])->save();

            return $locked->refresh();
        });
    }
}
