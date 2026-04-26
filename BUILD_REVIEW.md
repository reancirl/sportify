# Build Review — Pikol MVP

Verdict: **Block.** Tests pass (services exercised directly), but the Inertia/web flow has multiple unreachable routes, a service↔component type mismatch on the booking time picker, and zero of the seven notifications are ever dispatched. Triage in this order:

1. Wire all frontend URLs to Wayfinder route helpers (or reuse the actual route names).
2. Coerce `BookingService::availableSlots()` to a typed shape and update `TimeSlotPicker` + `models.ts`.
3. Route every Inertia `render()` through its API Resource so the documented JSON contract is actually applied.
4. Dispatch notifications from services.
5. Then sweep the Medium / Low items.

---

## Blocker

- **`resources/js/pages/player/bookings/create.tsx:54,62,74,88`** — Posts to `/player/bookings/create` and `/player/bookings`, but registered routes are `bookings/create` and `bookings` with no `/player` prefix. Every booking-creation request will 404. Use `route('player.bookings.store')` / Wayfinder helpers.
- **`resources/js/pages/venue-admin/payments/index.tsx:26,45`** — POSTs to `/venue-admin/payments/${id}/{verify,reject}`. Real routes are nested under venue: `/venue-admin/venues/{venue}/payments/{payment}/{verify,reject}`. The page also lacks a `venue` prop, so it cannot construct the right URL — the controller already requires a `Venue` route binding.
- **`resources/js/pages/venue-admin/sessions/create.tsx:53`** — POSTs to `/venue-admin/sessions`. No such route. Actual: `/venue-admin/venues/{venue}/sessions`. Page also expects `venues: Venue[]`, but the controller only sends a single `venue`. Whole page is mis-wired.
- **`resources/js/pages/venue-admin/sessions/index.tsx:33`** — Links to `/venue-admin/sessions/create`; no such route.
- **`resources/js/pages/venue-admin/bookings/index.tsx:62`** — Links to `/venue-admin/bookings/${id}`; real route is `/venue-admin/venues/{venue}/bookings/{booking}`. Detail page unreachable.
- **`resources/js/pages/venue-admin/venues/edit.tsx:41`** — `method="put"` to `/venue-admin/venues/{id}`, but route is registered as `PATCH`. Update will 405.
- **`resources/js/components/booking/booking-card.tsx:41`, `pages/dashboard.tsx:17,34`, `components/session/session-card.tsx:55`, `pages/public/venue-show.tsx:140`, `pages/player/bookings/index.tsx:33,69`** — All link to `/player/...`. None of those URLs exist.
- **`resources/js/pages/player/bookings/create.tsx:30,170`** — Type contract drift: `BookingService::availableSlots()` returns `array<{starts_at, ends_at, available}>` but the page declares `slots: string[]` and `TimeSlotPicker` expects `string[]`. Result: time picker non-functional. Either coerce in the controller or expand the TS type.
- **All 7 Notification classes never dispatched.** `BookingConfirmed`, `PaymentVerified`, `SessionJoined`, `VenueApproved`, `BookingCancelled`, `PaymentRejected`, `VenueRejected` exist but no `notify()` / `Notification::send` call exists in services or controllers. Wire them: `BookingService::createBooking` (confirmed/cancelled), `PaymentService::verifyPayment` / `rejectPayment`, `OpenPlayService::joinSession`, `VenueApprovalService::approve` / `reject`.

## High

- **All Inertia controllers bypass their Resource classes.** `Player\BookingController::show`, `SessionController::show`, `VenueAdmin\BookingController::show`, `Public\VenueController::show`, `VenueAdmin\VenueController::edit`, etc. all call `Inertia::render(..., ['booking' => $booking])` with the raw Eloquent model. The TS interfaces in `models.ts` are documented as the Resource shape (UTC ISO datetimes, money-as-string), but raw models serialize via Eloquent + `app.timezone='Asia/Manila'`. Convert every Inertia return to use `BookingResource::make($booking)->resolve()` / `Resource::collection(...)`. This is the single biggest contract violation in the build.
- **`app/Http/Resources/UserResource.php:30`** — `$this->getRoleNames()` triggers a Spatie role-load query for every user in a paginated collection (admin/users index = 25 N+1). Wrap in `whenLoaded('roles')` and have controllers `with('roles')`.
- **`app/Http/Controllers/VenueAdmin/PaymentController.php:33-37`** — Two extra subqueries (Booking + SessionPlayer pluck) per request. Replace with `whereHasMorph('payable', [Booking::class, SessionPlayer::class], ...)`.
- **`app/Http/Controllers/VenueAdmin/BookingController.php:18`** — `whereIn('court_id', $venue->courts()->pluck('id'))` runs an extra query and loads ids in memory. Use `whereHas('court', fn ($q) => $q->where('venue_id', $venue->id))`.
- **`app/Http/Controllers/Public/VenueController.php`** — Renders `$venue` raw; `cover_image_path` and `images[].image_path` never resolve via `Storage::url()` so images break in the UI. Route through `VenueResource` and add a URL accessor (or expose `cover_image_url` / `image_url` on the Resources).
- **`app/Services/Booking/BookingService.php:175-184`** — `isUniqueConstraintViolation` matches by string-sniffing message contents (`'UNIQUE'`, `'Duplicate entry'`). Brittle across DB drivers and locales. Use `$exception->errorInfo[0] === '23000'` (SQLSTATE) consistently.
- **`database/migrations/2026_04_26_022900_add_pickleball_columns_to_users_table.php:18`** — `elo_rating` is both `nullable()` and `default(1000)` — pick one (drop `nullable()`).
- **`resources/js/pages/venue-admin/sessions/create.tsx:39-49`** — Form has no `court_ids` field, but `StoreOpenPlaySessionRequest` requires it. Form will always 422.
- **`app/Notifications/*`** — All seven use the `Queueable` trait but do NOT `implement ShouldQueue`. Result: mail goes synchronously inside the request. Add `implements ShouldQueue`.
- **`app/Http/Resources/PaymentResource.php:29`** — Exposes raw `proof_image_path` alongside `proof_url`. Drop one (keep `proof_url`).

## Medium

- **`app/Http/Controllers/VenueAdmin/CourtController.php:31-35,48-53`** — `Court::create([...$data, 'slot_minutes' => $data['slot_minutes'] ?? 60, ...])` — controller-supplied keys override request-supplied keys (PHP later-keys-win), which is correct here, but the same pattern in `VenueController::store` is fragile. Prefer `Arr::except` / explicit `array_merge` for clarity.
- **`app/Http/Controllers/VenueAdmin/StaffController.php:32-39`** — `assignRole(...)` runs every time a staff record is created or updated. Use `if (! $user->hasRole(...))` to avoid Spatie pivot dupes.
- **`app/Http/Controllers/Player/BookingController.php:103`** — `$booking->forceFill(['notes' => ...])->save()` bypasses fillable + events. Use `$booking->update(['notes' => $notes])`.
- **`database/migrations/2026_04_26_022909_create_open_play_sessions_table.php:16`** — `cascadeOnDelete()` on `venue_id`. Venues are soft-deleted so this rarely fires, but `restrictOnDelete()` is safer for audit.
- **`app/Services/Booking/BookingService.php:38-39`** — `$slotMinutes = $court->slot_minutes ?: 60;` — a court with `slot_minutes = 0` silently falls back to 60. Use `?? 60`.
- **`routes/web.php`** — No throttle on `payments.upload-proof` (file upload), `bookings.store`, `sessions.join`. Add `->middleware('throttle:30,1')` on file uploads at minimum.
- **`app/Models/User.php:18`** — `#[Fillable]` attribute is a Laravel 13 feature. Most teams still use `protected $fillable = [...]` for compatibility. Verify it actually applies to the Authenticatable parent.
- **`app/Http/Requests/Staff/StoreStaffRequest.php:27`** — `'exists:users,email'` leaks user existence. Acceptable since admin-gated.
- **`app/Http/Controllers/Player/SessionController.php:32-34`** — `is_joined` boolean derived per request via subquery. Could eager-load `players` filtered by user once.

## Low

- **`resources/js/components/payment/payment-proof-upload.tsx:2`, `components/session/join-session-dialog.tsx:2`, `pages/admin/users/index.tsx:2`, `pages/admin/venues/index.tsx:2`** — Extra spaces in import lines (`useState   }`). Lint catches.
- **`app/Http/Resources/PaymentResource.php:40-47`** — Nested ternary for payable polymorph is hard to read; extract to helper.
- **`app/Models/User.php:54`** — `venuesOwned` reads better as `ownedVenues`.
- **`app/Models/Booking.php:70-73`** — `scopeUpcoming` uses `now()` (implicitly Manila TZ). Use `now('UTC')` for clarity.
- **`database/seeders/DemoDataSeeder.php`** — `Hash::make('password')` six times; the User factory's `password` cast already hashes. Redundant.
- **`app/Notifications/SessionJoined.php:32`** — `Time::displayManila` pattern uses `M j, Y g:i A` here vs `PPp` on the frontend. Inconsistent.

---

## Auto-fixed during this build

Two extra issues were fixed during the smoke-test pass after review (caught when the user actually loaded `/` and `/admin/venues`):

- **Landing page (`/`)** was still rendering the starter-kit `welcome.tsx`. Replaced with `resources/js/pages/public/landing.tsx` (Pikol-branded hero, four feature cards, CTA to `/venues`); `routes/web.php` now points `home` at `public/landing`. App logo string updated to "Pikol".
- **`PaginationNav` runtime crash**: `Cannot read properties of undefined (reading 'last_page')`. Root cause: `PaginatedResponse<T>` declared the API Resource Collection shape (`{ data, meta, links }`) but controllers emit raw paginator output (`{ current_page, last_page, data, links: PaginatorLink[], next_page_url, prev_page_url, ... }`) because they bypass Resource collections. Updated the type to match the actual wire payload and rewrote `PaginationNav` to read `last_page`, `current_page`, `next_page_url`, `prev_page_url` directly. **This is a tactical fix.** The proper long-term fix is the High-priority "route every Inertia render through its Resource" item above — once that lands, swap the `PaginatedResponse` definition back to the `{ data, meta, links }` shape.

The trivial whitespace import typos (the `useState   }` extra-spaces lint nits) noted in the Low section were NOT auto-corrected (lint did not flag them as errors), but they are cosmetic only.

## Out of scope (not flagged)

- `config('app.timezone') = 'Asia/Manila'` — known footgun, captured in `BUILD_NOTES.md`. Keep flagged for the architect, but the reviewer didn't double-flag.
- The `match_results` future-proofing stub.
- Booking unique `(court_id, starts_at)` only catching exact-start collisions — overlap detection lives in `BookingService::assertSlotIsAvailable` and is tested.
