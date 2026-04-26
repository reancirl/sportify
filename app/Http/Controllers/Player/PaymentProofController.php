<?php

namespace App\Http\Controllers\Player;

use App\Exceptions\Domain\InvalidPaymentProofException;
use App\Exceptions\Domain\PaymentAlreadyFinalizedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\UploadPaymentProofRequest;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Http\RedirectResponse;

class PaymentProofController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function update(UploadPaymentProofRequest $request, Payment $payment): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->payments->uploadProof(
                $payment,
                $data['proof'],
                $data['reference_number'] ?? null,
            );
        } catch (InvalidPaymentProofException $e) {
            return back()->withErrors(['proof' => $e->getMessage()]);
        } catch (PaymentAlreadyFinalizedException) {
            return back()->withErrors(['proof' => 'This payment has already been finalized.']);
        }

        return back()->with('success', 'Payment proof uploaded. Awaiting verification.');
    }
}
