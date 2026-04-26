<?php

namespace App\Http\Controllers\Player;

use App\Exceptions\Domain\AlreadyJoinedSessionException;
use App\Exceptions\Domain\SessionFullException;
use App\Exceptions\Domain\SessionNotJoinableException;
use App\Exceptions\Domain\SkillLevelMismatchException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Session\JoinSessionRequest;
use App\Models\OpenPlaySession;
use App\Services\OpenPlay\OpenPlayService;
use Illuminate\Http\RedirectResponse;

class SessionJoinController extends Controller
{
    public function __construct(private readonly OpenPlayService $openPlay) {}

    public function store(JoinSessionRequest $request, OpenPlaySession $session): RedirectResponse
    {
        try {
            $this->openPlay->joinSession($request->user(), $session);
        } catch (SessionFullException) {
            return back()->withErrors(['join' => 'This session is full.']);
        } catch (AlreadyJoinedSessionException) {
            return back()->withErrors(['join' => 'You have already joined this session.']);
        } catch (SkillLevelMismatchException $e) {
            return back()->withErrors(['join' => 'Your skill level does not meet the session requirements.']);
        } catch (SessionNotJoinableException) {
            return back()->withErrors(['join' => 'This session is no longer accepting players.']);
        }

        return redirect()
            ->route('player.sessions.show', $session)
            ->with('success', 'Joined session. Please upload payment proof if required.');
    }
}
