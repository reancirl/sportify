<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Enums\VenueStaffRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreStaffRequest;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueStaffMember;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $staff = $venue->staff()
            ->with('user:id,name,email')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('venue-admin/staff/index', [
            'venue' => $venue,
            'staff' => $staff,
        ]);
    }

    public function store(StoreStaffRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->firstOrFail();

        VenueStaffMember::updateOrCreate(
            ['venue_id' => $venue->id, 'user_id' => $user->id],
            ['role' => VenueStaffRole::from($data['role'])],
        );

        $user->assignRole($data['role'] === 'owner' ? 'venue_owner' : 'venue_staff');

        return back()->with('success', "{$user->name} added to staff.");
    }

    public function destroy(Venue $venue, VenueStaffMember $staff): RedirectResponse
    {
        abort_unless($staff->venue_id === $venue->id, 404);
        $this->authorize('update', $venue);

        $staff->delete();

        return back()->with('success', 'Staff member removed.');
    }
}
