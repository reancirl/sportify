<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Enums\SessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\OpenPlay\StoreOpenPlaySessionRequest;
use App\Models\OpenPlaySession;
use App\Models\Venue;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $sessions = $venue->sessions()
            ->with(['creator', 'players'])
            ->orderByDesc('starts_at')
            ->paginate(20);

        return Inertia::render('venue-admin/sessions/index', [
            'venue' => $venue,
            'sessions' => $sessions,
        ]);
    }

    public function create(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $venue->load(['courts' => fn ($q) => $q->active()]);

        return Inertia::render('venue-admin/sessions/create', [
            'venue' => $venue,
        ]);
    }

    public function store(StoreOpenPlaySessionRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        $session = $venue->sessions()->create([
            ...$data,
            'created_by' => $request->user()->id,
            'status' => SessionStatus::Scheduled,
            'min_skill_level' => $data['min_skill_level'] ?? null,
            'max_skill_level' => $data['max_skill_level'] ?? null,
        ]);

        return redirect()
            ->route('venue-admin.venues.sessions.index', $venue)
            ->with('success', "Session \"{$session->title}\" scheduled.");
    }

    public function destroy(Venue $venue, OpenPlaySession $session): RedirectResponse
    {
        abort_unless($session->venue_id === $venue->id, 404);
        $this->authorize('delete', $session);

        $session->update(['status' => SessionStatus::Cancelled]);

        return back()->with('success', 'Session cancelled.');
    }
}
