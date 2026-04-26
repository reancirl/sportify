<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\SessionStatus;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\OpenPlaySession;
use App\Models\Payment;
use App\Models\User;
use App\Models\Venue;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user->hasRole('super_admin')) {
            return Inertia::render('admin/dashboard', $this->superAdminPayload());
        }

        if ($user->hasRole('venue_owner') || $user->hasRole('venue_staff')) {
            return Inertia::render('venue-admin/dashboard', $this->venueAdminPayload($user));
        }

        return Inertia::render('dashboard', [
            'role' => 'player',
            ...$this->playerPayload($user),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function superAdminPayload(): array
    {
        $weekAgo = CarbonImmutable::now()->subWeek();

        $venueCounts = Venue::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $pendingVenues = Venue::query()
            ->where('status', VenueStatus::Pending)
            ->with('owner:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'slug', 'name', 'city', 'province', 'owner_id', 'created_at']);

        return [
            'stats' => [
                'pending_venues' => (int) ($venueCounts[VenueStatus::Pending->value] ?? 0),
                'approved_venues' => (int) ($venueCounts[VenueStatus::Approved->value] ?? 0),
                'rejected_venues' => (int) ($venueCounts[VenueStatus::Rejected->value] ?? 0),
                'total_members' => User::query()->count(),
                'new_members_this_week' => User::query()
                    ->where('created_at', '>=', $weekAgo)
                    ->count(),
                'total_bookings' => Booking::query()->count(),
                'bookings_this_week' => Booking::query()
                    ->where('created_at', '>=', $weekAgo)
                    ->count(),
            ],
            'pending_venues' => $pendingVenues,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function venueAdminPayload(User $user): array
    {
        $venueIds = $this->scopedVenueIds($user);

        $now = CarbonImmutable::now();
        $weekAhead = $now->addWeek();

        $courts = Court::query()
            ->whereIn('venue_id', $venueIds)
            ->selectRaw('SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active, COUNT(*) as total')
            ->first();

        $upcomingBookings = Booking::query()
            ->whereHas('court', fn ($q) => $q->whereIn('venue_id', $venueIds))
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::PendingPayment])
            ->where('starts_at', '>=', $now)
            ->where('starts_at', '<', $weekAhead)
            ->count();

        $pendingPayments = Payment::query()
            ->whereHasMorph(
                'payable',
                [Booking::class],
                fn ($q) => $q->whereHas('court', fn ($qq) => $qq->whereIn('venue_id', $venueIds))
            )
            ->where('status', PaymentStatus::Pending)
            ->count();

        $upcomingSessions = OpenPlaySession::query()
            ->whereIn('venue_id', $venueIds)
            ->whereIn('status', [SessionStatus::Scheduled, SessionStatus::Full])
            ->where('starts_at', '>=', $now)
            ->orderBy('starts_at')
            ->limit(5)
            ->get(['id', 'venue_id', 'title', 'starts_at', 'ends_at', 'max_players', 'fee_per_player', 'status']);

        $todayBookings = Booking::query()
            ->whereHas('court', fn ($q) => $q->whereIn('venue_id', $venueIds))
            ->where('status', BookingStatus::Confirmed)
            ->whereDate('starts_at', $now->toDateString())
            ->with(['court:id,name,venue_id', 'user:id,name'])
            ->orderBy('starts_at')
            ->limit(5)
            ->get(['id', 'court_id', 'user_id', 'starts_at', 'ends_at']);

        $venues = Venue::query()
            ->whereIn('id', $venueIds)
            ->get(['id', 'name', 'slug', 'status', 'city']);

        return [
            'venues' => $venues,
            'stats' => [
                'active_courts' => (int) ($courts->active ?? 0),
                'total_courts' => (int) ($courts->total ?? 0),
                'upcoming_bookings' => $upcomingBookings,
                'pending_payments' => $pendingPayments,
            ],
            'upcoming_sessions' => $upcomingSessions,
            'today_bookings' => $todayBookings,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function playerPayload(User $user): array
    {
        $now = CarbonImmutable::now();

        $upcomingBookings = $user->bookings()
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::PendingPayment])
            ->where('starts_at', '>=', $now)
            ->orderBy('starts_at')
            ->limit(3)
            ->with(['court:id,name,venue_id', 'court.venue:id,name,city,slug'])
            ->get(['id', 'court_id', 'starts_at', 'ends_at', 'status', 'total_amount']);

        return [
            'stats' => [
                'upcoming_bookings' => $user->bookings()
                    ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::PendingPayment])
                    ->where('starts_at', '>=', $now)
                    ->count(),
                'completed_bookings' => $user->bookings()
                    ->where('status', BookingStatus::Completed)
                    ->count(),
                'sessions_joined' => $user->sessionEntries()->count(),
            ],
            'upcoming_bookings' => $upcomingBookings,
        ];
    }

    /**
     * @return list<string>
     */
    private function scopedVenueIds(User $user): array
    {
        if ($user->hasRole('venue_owner')) {
            return $user->venuesOwned()->pluck('id')->all();
        }

        return $user->venueMemberships()->pluck('venue_id')->all();
    }
}
