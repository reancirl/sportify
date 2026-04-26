<?php

namespace App\Http\Controllers\Admin;

use App\Enums\VenueStatus;
use App\Exceptions\Domain\VenueAlreadyApprovedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Venue\RejectVenueRequest;
use App\Http\Requests\Venue\SuspendVenueRequest;
use App\Models\Venue;
use App\Services\Venue\VenueApprovalService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VenueApprovalController extends Controller
{
    public function __construct(private readonly VenueApprovalService $approval) {}

    public function index(Request $request): Response
    {
        $venues = Venue::query()
            ->when(
                $request->string('status')->toString() !== '',
                fn ($q) => $q->where('status', $request->string('status')->toString()),
            )
            ->with('owner')
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('admin/venues/index', [
            'venues' => $venues,
            'filters' => [
                'status' => $request->string('status')->toString() ?: null,
            ],
            'statuses' => array_map(fn (VenueStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ], VenueStatus::cases()),
        ]);
    }

    public function approve(Request $request, Venue $venue): RedirectResponse
    {
        $this->authorize('approve', $venue);

        try {
            $this->approval->approve($venue, $request->user());
        } catch (VenueAlreadyApprovedException) {
            return back()->withErrors(['venue' => 'Venue already approved.']);
        }

        return back()->with('success', "{$venue->name} approved.");
    }

    public function reject(RejectVenueRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->approval->reject($venue, $request->user(), $data['rejection_reason']);
        } catch (VenueAlreadyApprovedException) {
            return back()->withErrors(['venue' => 'Venue already approved — cannot reject.']);
        }

        return back()->with('success', "{$venue->name} rejected.");
    }

    public function suspend(SuspendVenueRequest $request, Venue $venue): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->approval->suspend($venue, $request->user(), $data['suspension_reason']);
        } catch (DomainException $e) {
            return back()->withErrors(['venue' => $e->getMessage()]);
        }

        return back()->with('success', "{$venue->name} suspended.");
    }

    public function reinstate(Request $request, Venue $venue): RedirectResponse
    {
        $this->authorize('reinstate', $venue);

        try {
            $this->approval->reinstate($venue, $request->user());
        } catch (DomainException $e) {
            return back()->withErrors(['venue' => $e->getMessage()]);
        }

        return back()->with('success', "{$venue->name} reinstated.");
    }
}
