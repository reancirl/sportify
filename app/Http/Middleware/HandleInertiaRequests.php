<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $this->shareUser($request->user()),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Augment the shared user with role names and the primary venue scope
     * so the sidebar can render role-aware nav without an extra request.
     *
     * @return array<string, mixed>|null
     */
    private function shareUser(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $roles = $user->getRoleNames()->all();

        $primaryVenueId = $user->venuesOwned()->orderBy('created_at')->value('id')
            ?? $user->venueMemberships()
                ->orderBy('created_at')
                ->with('venue:id')
                ->first()
                ?->venue_id;

        return [
            ...$user->toArray(),
            'roles' => $roles,
            'primary_venue_id' => $primaryVenueId,
        ];
    }
}
