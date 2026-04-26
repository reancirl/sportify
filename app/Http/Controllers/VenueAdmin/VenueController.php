<?php

namespace App\Http\Controllers\VenueAdmin;

use App\Enums\Amenity;
use App\Enums\CourtSurfaceType;
use App\Enums\VenueStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Venue\StoreVenueRequest;
use App\Http\Requests\Venue\UpdateVenueRequest;
use App\Models\Venue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $venues = Venue::query()
            ->when(! $user->hasRole('super_admin'), function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                    ->orWhereHas('staff', fn ($s) => $s->where('user_id', $user->id));
            })
            ->withCount('courts')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('venue-admin/venues/index', [
            'venues' => $venues,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Venue::class);

        return Inertia::render('venue-admin/venues/create', [
            'amenities' => Amenity::options(),
            'surfaceTypes' => array_map(
                fn (CourtSurfaceType $s) => ['value' => $s->value, 'label' => $s->label()],
                CourtSurfaceType::cases(),
            ),
        ]);
    }

    public function store(StoreVenueRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $courtsInput = $data['courts'] ?? [];
        unset($data['courts']);

        $venue = DB::transaction(function () use ($data, $courtsInput, $request) {
            $venue = Venue::create([
                ...$data,
                'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
                'owner_id' => $request->user()->id,
                'timezone' => $data['timezone'] ?? 'Asia/Manila',
                'status' => VenueStatus::Pending,
            ]);

            foreach ($courtsInput as $court) {
                $venue->courts()->create([
                    'name' => $court['name'],
                    'surface_type' => $court['surface_type'] ?? null,
                    'hourly_rate' => $court['hourly_rate'],
                    'slot_minutes' => $court['slot_minutes'] ?? 60,
                    'is_active' => $court['is_active'] ?? true,
                ]);
            }

            return $venue;
        });

        return redirect()
            ->route('venue-admin.venues.edit', $venue)
            ->with('success', 'Venue submitted for approval.');
    }

    public function edit(Venue $venue): Response
    {
        $this->authorize('update', $venue);

        $venue->load(['operatingHours', 'images', 'courts']);

        return Inertia::render('venue-admin/venues/edit', [
            'venue' => $venue,
            'amenities' => Amenity::options(),
        ]);
    }

    public function update(UpdateVenueRequest $request, Venue $venue): RedirectResponse
    {
        $venue->update($request->validated());

        return back()->with('success', 'Venue updated.');
    }
}
