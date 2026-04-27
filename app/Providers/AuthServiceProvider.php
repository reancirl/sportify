<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Court;
use App\Models\OpenPlaySession;
use App\Models\Payment;
use App\Models\Venue;
use App\Models\VenuePaymentMethod;
use App\Policies\BookingPolicy;
use App\Policies\CourtPolicy;
use App\Policies\OpenPlaySessionPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\VenuePaymentMethodPolicy;
use App\Policies\VenuePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Venue::class => VenuePolicy::class,
        VenuePaymentMethod::class => VenuePaymentMethodPolicy::class,
        Court::class => CourtPolicy::class,
        Booking::class => BookingPolicy::class,
        OpenPlaySession::class => OpenPlaySessionPolicy::class,
        Payment::class => PaymentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(fn ($user) => $user->hasRole('super_admin') ? true : null);
    }
}
