<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Enums\PaymentProvider;
use App\Http\Controllers\Controller;
use App\Http\Requests\Venue\StoreVenuePaymentMethodRequest;
use App\Http\Requests\Venue\UpdateVenuePaymentMethodRequest;
use App\Http\Resources\VenuePaymentMethodResource;
use App\Models\Venue;
use App\Models\VenuePaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(Venue $venue): Response
    {
        $this->authorize('viewAny', [VenuePaymentMethod::class, $venue]);

        $methods = $venue->paymentMethods()->orderBy('sort_order')->get();

        return Inertia::render('venue-admin/payment-methods/index', [
            'venue' => $venue,
            'paymentMethods' => VenuePaymentMethodResource::collection($methods),
            'providers' => array_map(
                fn (PaymentProvider $p) => ['value' => $p->value, 'label' => $p->label()],
                PaymentProvider::cases(),
            ),
        ]);
    }

    public function store(StoreVenuePaymentMethodRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        if ($venue->paymentMethods()->where('provider', $data['provider'])->exists()) {
            return back()->withErrors([
                'provider' => 'This venue already has a payment method for that provider. Edit the existing one instead.',
            ])->withInput();
        }

        $venue->paymentMethods()->create([
            'provider' => $data['provider'],
            'account_name' => $data['account_name'],
            'mobile_number' => $data['mobile_number'],
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Payment method added.');
    }

    public function update(
        UpdateVenuePaymentMethodRequest $request,
        Venue $venue,
        VenuePaymentMethod $paymentMethod,
    ): RedirectResponse {
        abort_unless($paymentMethod->venue_id === $venue->id, 404);
        $this->authorize('update', $paymentMethod);

        $data = $request->validated();

        $paymentMethod->update([
            'account_name' => $data['account_name'],
            'mobile_number' => $data['mobile_number'],
            'is_active' => $data['is_active'] ?? $paymentMethod->is_active,
            'sort_order' => $data['sort_order'] ?? $paymentMethod->sort_order,
        ]);

        return back()->with('success', 'Payment method updated.');
    }

    public function destroy(Venue $venue, VenuePaymentMethod $paymentMethod): RedirectResponse
    {
        abort_unless($paymentMethod->venue_id === $venue->id, 404);
        $this->authorize('delete', $paymentMethod);

        $paymentMethod->delete();

        return back()->with('success', 'Payment method removed.');
    }
}
