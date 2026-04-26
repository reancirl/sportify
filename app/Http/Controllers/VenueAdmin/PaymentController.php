<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Exceptions\Domain\PaymentAlreadyVerifiedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\RejectPaymentRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\SessionPlayer;
use App\Models\Venue;
use App\Services\Payment\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function index(Request $request, Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $courtIds = $venue->courts()->pluck('id');
        $sessionIds = $venue->sessions()->pluck('id');

        $payments = Payment::query()
            ->where(function ($q) use ($courtIds, $sessionIds) {
                $q->where(function ($qq) use ($courtIds) {
                    $qq->where('payable_type', Booking::class)
                        ->whereIn('payable_id', Booking::whereIn('court_id', $courtIds)->pluck('id'));
                })->orWhere(function ($qq) use ($sessionIds) {
                    $qq->where('payable_type', SessionPlayer::class)
                        ->whereIn('payable_id', SessionPlayer::whereIn('session_id', $sessionIds)->pluck('id'));
                });
            })
            ->with(['user', 'verifier', 'payable'])
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('venue-admin/payments/index', [
            'venue' => $venue,
            'payments' => $payments,
        ]);
    }

    public function verify(Request $request, Venue $venue, Payment $payment): RedirectResponse
    {
        $this->authorize('verify', $payment);

        try {
            $this->payments->verifyPayment($payment, $request->user());
        } catch (PaymentAlreadyVerifiedException) {
            return back()->withErrors(['payment' => 'Payment already verified.']);
        }

        return back()->with('success', 'Payment verified.');
    }

    public function reject(RejectPaymentRequest $request, Venue $venue, Payment $payment): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->payments->rejectPayment($payment, $request->user(), $data['rejection_reason']);
        } catch (PaymentAlreadyVerifiedException) {
            return back()->withErrors(['payment' => 'Payment already verified — cannot reject.']);
        }

        return back()->with('success', 'Payment rejected.');
    }
}
