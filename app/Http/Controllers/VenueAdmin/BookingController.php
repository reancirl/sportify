<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Venue;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $bookings = Booking::query()
            ->whereIn('court_id', $venue->courts()->pluck('id'))
            ->with(['user', 'court', 'payment'])
            ->orderByDesc('starts_at')
            ->paginate(25);

        return Inertia::render('venue-admin/bookings/index', [
            'venue' => $venue,
            'bookings' => $bookings,
        ]);
    }

    public function show(Venue $venue, Booking $booking): Response
    {
        $this->authorize('view', $booking);
        abort_unless($booking->court->venue_id === $venue->id, 404);

        $booking->load(['user', 'court', 'payment']);

        return Inertia::render('venue-admin/bookings/show', [
            'venue' => $venue,
            'booking' => $booking,
        ]);
    }
}
