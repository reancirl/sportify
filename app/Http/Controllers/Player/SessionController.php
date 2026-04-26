<?php

namespace App\Http\Controllers\Player;

use App\Http\Controllers\Controller;
use App\Models\OpenPlaySession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = OpenPlaySession::query()
            ->upcoming()
            ->with(['venue', 'players'])
            ->orderBy('starts_at')
            ->paginate(20);

        return Inertia::render('player/sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    public function show(Request $request, OpenPlaySession $session): Response
    {
        $session->load(['venue', 'creator', 'players.user']);

        return Inertia::render('player/sessions/show', [
            'session' => $session,
            'is_joined' => $session->players()
                ->where('user_id', $request->user()->id)
                ->exists(),
        ]);
    }
}
