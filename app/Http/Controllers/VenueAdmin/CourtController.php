<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Enums\CourtSurfaceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Court\StoreCourtRequest;
use App\Http\Requests\Court\UpdateCourtRequest;
use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourtController extends Controller
{
    public function index(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $courts = $venue->courts()->orderBy('name')->get();

        return Inertia::render('venue-admin/courts/index', [
            'venue' => $venue,
            'courts' => $courts,
            'surfaceTypes' => array_map(
                fn (CourtSurfaceType $s) => ['value' => $s->value, 'label' => $s->label()],
                CourtSurfaceType::cases(),
            ),
        ]);
    }

    public function store(StoreCourtRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        $court = $venue->courts()->create([
            ...$data,
            'slot_minutes' => $data['slot_minutes'] ?? 60,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()
            ->route('venue-admin.venues.courts.index', $venue)
            ->with('success', "Court \"{$court->name}\" created.");
    }

    public function update(UpdateCourtRequest $request, Venue $venue, Court $court): RedirectResponse
    {
        abort_unless($court->venue_id === $venue->id, 404);

        $data = $request->validated();

        $court->update([
            ...$data,
            'slot_minutes' => $data['slot_minutes'] ?? $court->slot_minutes,
            'is_active' => $data['is_active'] ?? $court->is_active,
        ]);

        return back()->with('success', 'Court updated.');
    }

    public function destroy(Venue $venue, Court $court): RedirectResponse
    {
        abort_unless($court->venue_id === $venue->id, 404);
        $this->authorize('delete', $venue);

        $court->delete();

        return back()->with('success', 'Court archived.');
    }
}
