<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\VenueApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Player\BookingController as PlayerBookingController;
use App\Http\Controllers\Player\PaymentProofController;
use App\Http\Controllers\Player\SessionController as PlayerSessionController;
use App\Http\Controllers\Player\SessionJoinController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\VenueController as PublicVenueController;
use App\Http\Controllers\VenueAdmin\BookingController as VenueAdminBookingController;
use App\Http\Controllers\VenueAdmin\CourtController as VenueAdminCourtController;
use App\Http\Controllers\VenueAdmin\PaymentController as VenueAdminPaymentController;
use App\Http\Controllers\VenueAdmin\SessionController as VenueAdminSessionController;
use App\Http\Controllers\VenueAdmin\StaffController;
use App\Http\Controllers\VenueAdmin\VenueController as VenueAdminVenueController;
use Illuminate\Support\Facades\Route;

// Public venue marketplace
Route::get('/', [PublicVenueController::class, 'landing'])->name('home');
Route::get('venues', [PublicVenueController::class, 'index'])->name('venues.index');
Route::get('venues/{venue:slug}', [PublicVenueController::class, 'show'])->name('venues.show');

// Public guest checkout — no auth required.
Route::get('checkout', [CheckoutController::class, 'show'])
    ->name('checkout.show');
Route::post('checkout', [CheckoutController::class, 'store'])
    ->name('checkout.store');
Route::get('checkout/success/{booking}', [CheckoutController::class, 'success'])
    ->whereUuid('booking')
    ->name('checkout.success');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Player area (any authenticated user)
    Route::name('player.')->group(function () {
        Route::get('bookings', [PlayerBookingController::class, 'index'])->name('bookings.index');
        Route::get('bookings/create', [PlayerBookingController::class, 'create'])->name('bookings.create');
        Route::post('bookings', [PlayerBookingController::class, 'store'])->name('bookings.store');
        Route::get('bookings/{booking}', [PlayerBookingController::class, 'show'])
            ->whereUuid('booking')
            ->name('bookings.show');
        Route::delete('bookings/{booking}', [PlayerBookingController::class, 'destroy'])
            ->whereUuid('booking')
            ->name('bookings.destroy');

        Route::get('sessions', [PlayerSessionController::class, 'index'])->name('sessions.index');
        Route::get('sessions/{session}', [PlayerSessionController::class, 'show'])
            ->whereUuid('session')
            ->name('sessions.show');
        Route::post('sessions/{session}/join', [SessionJoinController::class, 'store'])
            ->whereUuid('session')
            ->name('sessions.join');

        Route::post('payments/{payment}/upload-proof', [PaymentProofController::class, 'update'])
            ->whereUuid('payment')
            ->name('payments.upload-proof');
    });

    // Venue admin area (venue_owner, venue_staff, super_admin)
    Route::middleware('role:venue_owner|venue_staff|super_admin')
        ->prefix('venue-admin')
        ->name('venue-admin.')
        ->group(function () {
            Route::get('venues', [VenueAdminVenueController::class, 'index'])->name('venues.index');
            Route::get('venues/create', [VenueAdminVenueController::class, 'create'])->name('venues.create');
            Route::post('venues', [VenueAdminVenueController::class, 'store'])->name('venues.store');

            Route::prefix('venues/{venue}')->name('venues.')->whereUuid('venue')->group(function () {
                Route::get('edit', [VenueAdminVenueController::class, 'edit'])->name('edit');
                Route::patch('/', [VenueAdminVenueController::class, 'update'])->name('update');

                Route::get('courts', [VenueAdminCourtController::class, 'index'])->name('courts.index');
                Route::post('courts', [VenueAdminCourtController::class, 'store'])->name('courts.store');
                Route::patch('courts/{court}', [VenueAdminCourtController::class, 'update'])
                    ->whereUuid('court')
                    ->name('courts.update');
                Route::delete('courts/{court}', [VenueAdminCourtController::class, 'destroy'])
                    ->whereUuid('court')
                    ->name('courts.destroy');

                Route::get('sessions', [VenueAdminSessionController::class, 'index'])->name('sessions.index');
                Route::get('sessions/create', [VenueAdminSessionController::class, 'create'])->name('sessions.create');
                Route::post('sessions', [VenueAdminSessionController::class, 'store'])->name('sessions.store');
                Route::delete('sessions/{session}', [VenueAdminSessionController::class, 'destroy'])
                    ->whereUuid('session')
                    ->name('sessions.destroy');

                Route::get('bookings', [VenueAdminBookingController::class, 'index'])->name('bookings.index');
                Route::get('bookings/{booking}', [VenueAdminBookingController::class, 'show'])
                    ->whereUuid('booking')
                    ->name('bookings.show');

                Route::get('payments', [VenueAdminPaymentController::class, 'index'])->name('payments.index');
                Route::post('payments/{payment}/verify', [VenueAdminPaymentController::class, 'verify'])
                    ->whereUuid('payment')
                    ->name('payments.verify');
                Route::post('payments/{payment}/reject', [VenueAdminPaymentController::class, 'reject'])
                    ->whereUuid('payment')
                    ->name('payments.reject');

                Route::get('staff', [StaffController::class, 'index'])->name('staff.index');
                Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
                Route::delete('staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
            });
        });

    // Super admin area
    Route::middleware('role:super_admin')
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('venues', [VenueApprovalController::class, 'index'])->name('venues.index');
            Route::post('venues/{venue}/approve', [VenueApprovalController::class, 'approve'])
                ->whereUuid('venue')
                ->name('venues.approve');
            Route::post('venues/{venue}/reject', [VenueApprovalController::class, 'reject'])
                ->whereUuid('venue')
                ->name('venues.reject');
            Route::post('venues/{venue}/suspend', [VenueApprovalController::class, 'suspend'])
                ->whereUuid('venue')
                ->name('venues.suspend');
            Route::post('venues/{venue}/reinstate', [VenueApprovalController::class, 'reinstate'])
                ->whereUuid('venue')
                ->name('venues.reinstate');

            Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        });
});

require __DIR__.'/settings.php';
