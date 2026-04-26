# Build Notes — Overnight MVP Foundation Build

Build started: 2026-04-26.
Mode: unattended.

## Decisions / deviations from spec

### Skipped: `git init` and per-phase commits
- **Reason:** the harness denied `git init` as a destructive action (project was not a pre-existing repo, but policy treats `git init` on a non-repo project as irreversible state change).
- **Impact:** no commit history. All code changes are on disk. User can `git init && git add -A` after review.
- **Action for user:** init git manually after review. Phase boundaries are documented below in case a clean per-phase history is desired.

### Skipped: Laravel Breeze install
- **Reason:** the project is Laravel 13 + Fortify (the React starter-kit), NOT Laravel 11 + Breeze as the spec assumed. Breeze and Fortify are mutually exclusive auth backends. Installing Breeze on top of Fortify would overwrite working auth scaffolding (login, registration, settings pages all already in `resources/js/pages/auth/` and `resources/js/pages/settings/`).
- **Impact:** auth UI already works via Fortify + Inertia + React + TS. CLAUDE.md project skills already include `fortify-development` for any auth changes.
- **Action for user:** none. Existing auth scaffolding meets Phase 1 goal.

### Folder casing convention
- Spec used PascalCase paths (`resources/js/Pages/`, `Components/`, `Lib/`). Actual project uses lowercase per Laravel React starter-kit convention (`resources/js/pages/`, `components/`, `lib/`, `types/`, `layouts/`, `hooks/`).
- **Decision:** follow existing project convention (lowercase). CLAUDE.md explicitly says "follow all existing code conventions". Agent instructions tolerated either casing.

### Laravel version
- Spec said Laravel 11; actual is Laravel 13. No action needed — schema/services/policies APIs are compatible.

## Default decisions applied silently

(Per the spec's "Defaults for unattended decisions" section — listed here for traceability.)

- Currency: PHP (₱), `decimal(10,2)` in DB, `string` in TS, no multi-currency
- Operating hours: `time` columns interpreted in venue's `timezone` (default `Asia/Manila`)
- Booking slot length: 1 hour fixed; `slot_minutes` column on `courts` (default 60) for future flex
- Cancellation window: 24h before `starts_at`
- Payment proof: max 5MB, `jpg|png|webp` only, `public` disk under `payment-proofs/{year}/{month}/`
- Email queue: `database` driver, no worker started (README documents `php artisan queue:work`)
- Session court reservation: `BookingService::availableSlots` excludes courts blocked by overlapping `OpenPlaySession`
- Soft deletes: only on `venues` and `courts`
- UUIDs: standard Laravel `HasUuids` (UUID v4)

---

## Phase log

### Sub-agent delegation note
The 6 project subagents in `.claude/agents/` ARE registered (verified via `claude agents` earlier — they appear under "Project agents"). However, the Agent tool inside this harness session only exposes the built-in subagent types (general-purpose, Explore, Plan, statusline-setup, claude-code-guide). The custom project agents are not addressable via `subagent_type` here.

Workaround: phases that should go to a custom agent are dispatched to `general-purpose` with the relevant agent's system prompt embedded inline in the delegation prompt. Same persona, same scope discipline, just routed through the available tool. The agent files in `.claude/agents/` remain valuable — they will work for your own future `claude` CLI invocations.

### Phase 2: Schema — DONE
- 12 migrations created (alter users + 11 new tables) and applied via `migrate:fresh`.
- 8 enums in `app/Enums/`.
- 11 models with full relationships, scopes, casts.
- 5 policies + `AuthServiceProvider` with `Gate::before` super_admin override.
- `RoleSeeder` written (not run yet).
- 10 factories with status states.
- Pint passed.

### Phase 2 caveats from `db-migration-guard` (Caution-level — non-blocking, log for follow-up)
- **Postgres FK index gotcha**: Laravel does not auto-index FK columns. MySQL does implicitly; Postgres does not. Add explicit `->index()` on bare FK columns if this ever targets Postgres. Affected: `venue_images.venue_id`, `courts.venue_id`, `venues.owner_id`, `venue_staff.user_id`, `payments.user_id`, `session_players.user_id`, `match_results.open_play_session_id`. Project currently runs SQLite (dev) — not urgent but track.
- **`users.elo_rating` is both nullable and default(1000)** — pick one. Recommendation: drop `nullable()`, keep default 1000 so ranking math never sees NULL.
- **`open_play_sessions.venue_id` cascadeOnDelete** — debatable for audit integrity. Venues use soft-delete so unlikely to fire; restrictOnDelete would be safer. Low priority.
- **`match_results` missing `played_at` index** and `(court_id, played_at)` composite — future ranking query optimization. Stub table; not used in MVP.
- Booking unique `(court_id, starts_at)` only catches exact-start collisions; overlapping ranges (e.g., 9:00-10:30 vs 9:30-10:30) require app-level check. Service-builder must enforce in `BookingService`.

### Phase 3: Services + tests — DONE
- 4 services (Booking, OpenPlay, Payment, VenueApproval) with constructor injection.
- 11 domain exceptions in `app/Exceptions/Domain/`.
- 8 PHPUnit feature test classes — **35/35 tests pass, 72 assertions**.
- Pint clean.

### Phase 3 concern (logged for triage)
- **app.timezone vs UTC datetime storage:** Service-builder noted that with `config('app.timezone')='Asia/Manila'`, Eloquent's datetime cast rehydrates stored values as Manila time. They added a `normalizeStoredDatetime()` workaround in `BookingService`. The cleaner long-term fix is to set `config('app.timezone')='UTC'` and convert to Asia/Manila only at the UI/Resources layer (which `formatInManila()` already supports). For MVP, the workaround is in place and all tests pass — leaving as-is per user's explicit Phase 1 instruction. Revisit before production.

### Phase 4: Controllers + routes — DONE
- 11 controllers across `Public/`, `Player/`, `VenueAdmin/`, `Admin/` namespaces + `DashboardController`.
- Spatie middleware aliases (`role`, `permission`, `role_or_permission`) registered in `bootstrap/app.php`.
- 43 routes registered. Route model binding via UUID for venues/courts/bookings/sessions/payments; slug binding for public venue show.
- Inline `$request->validate()` calls used throughout — Phase 5 (api-contract-keeper) will replace them with Form Request classes.
- `php artisan test --compact` → **75 / 75 passing**, 208 assertions.
- Pint clean.
- TODO: write controller-level happy-path feature tests after Phase 5 (Form Requests in place).

### Phase 5: API contracts — DONE
- 12 Form Requests in `app/Http/Requests/{Booking,Court,OpenPlay,Payment,Session,Staff,Venue}/`. `authorize()` delegates to Policies.
- 11 API Resources in `app/Http/Resources/`. Money emitted as string, datetimes as UTC ISO 8601 (`?->utc()->toIso8601String()`), enums as `->value`. Relationships via `whenLoaded()`.
- New TypeScript file `resources/js/types/models.ts`: 8 enum unions + 11 model interfaces + `PaginatedResponse<T>`.
- New `Models` namespace re-exported via `resources/js/types/index.ts` to avoid clashing with the existing Inertia-shared `auth.User`.
- All controllers now consume typed Form Requests; `$request->validated()` replaces inline `validate()`. Inline `$this->authorize(...)` removed where Form Request handles it.
- `Payment::proofUrl` accessor added (Storage::disk('public')->url) — surfaced as `proof_url` in PaymentResource.
- `npx tsc --noEmit` clean. `php artisan test --compact` → 75/75 passing.

### Phase 6: Frontend scaffolding — DONE
- 19 Inertia pages across `pages/{public,player,venue-admin,admin}/`. Existing `pages/dashboard.tsx` updated for role awareness.
- 11 typed components in `components/{booking,session,payment,venue}/` + shared `pagination-nav.tsx`.
- New `layouts/public-layout.tsx` for unauthenticated marketplace pages; `app.tsx` updated to auto-mount it for `pages/public/*`.
- shadcn components installed on demand: `table`, `textarea` (others already present).
- `npx tsc --noEmit` → 0 errors. `npm run lint:check` → 0 errors.
- Routes wired via plain URL strings (Wayfinder not generated for these).

### Phase 7: Notifications + seeders + README — DONE
- 7 notification classes in `app/Notifications/` (BookingConfirmed, BookingCancelled, PaymentVerified, PaymentRejected, SessionJoined, VenueApproved, VenueRejected). All use `mail` + `database` channels with `// TODO: SMS` markers.
- `App\Lib\Time::displayManila()` helper used by notifications for Manila-formatted timestamps.
- `notifications` table migration created.
- `DemoDataSeeder` creates: 1 super admin, 2 venue owners, 1 staff per venue (2 total), 5 players with varied skill levels, 2 approved venues with operating hours + 3 courts each, 1 pending venue per owner (2 total), 1 upcoming open-play session per venue with 2 registered players, sample bookings (completed, confirmed, pending, cancelled), corresponding payments (verified, pending).
- Verified seed counts: 10 users, 4 venues (2 approved + 2 pending), 6 courts, 8 bookings, 2 sessions, 6 payments, 2 staff memberships.
- `php artisan storage:link` run.
- `README.md` written with setup, credentials, roles, architecture notes, roadmap.
- Pint clean. 75/75 tests still passing.

### Phase 8: Final review — DONE
- `code-reviewer` produced a Block verdict with ~12 Blocker findings (most centred on hardcoded frontend URLs that don't match registered routes, missing notification dispatches, controllers bypassing Resources, and the booking time-slot type drift).
- Findings saved to `BUILD_REVIEW.md` for triage. Per spec, Blocker findings are NOT auto-fixed.
- Two issues caught at smoke-test (loading `/` and admin login) WERE fixed inline so the build is at least bootable:
  1. Replaced default starter-kit landing with a Pikol-branded `pages/public/landing.tsx`; `app-logo.tsx` updated to "Pikol".
  2. `PaginationNav` was crashing because `PaginatedResponse<T>` was typed as the Resource Collection shape (`{ data, meta, links }`) but controllers emit raw paginator output. Updated type + component to match the real wire payload (tactical fix; revisit when controllers route through Resources).
- After fixes: `npx tsc --noEmit` clean, `npm run lint:check` clean, Pint clean, 75/75 tests pass.

### Final deliverables checklist
- [x] All migrations ran (`migrate:fresh` clean)
- [x] All seeders ran (`db:seed` succeeds — verified counts logged in Phase 7)
- [x] `npx tsc --noEmit` passes
- [x] `php artisan test --compact` passes — 75 tests, 208 assertions
- [ ] All 8 phases committed — **NOT done**: `git init` was denied by the harness; user must `git init && git add -A` after review. All 8 phase boundaries are documented above so a one-shot history can still be reconstructed if desired.
- [x] `BUILD_REVIEW.md` exists with code-reviewer findings
- [x] `README.md` is complete with seeded credentials

### Phase 1: Foundation — DONE
- Skipped Breeze (Fortify already in place — auth scaffolding works).
- Installed `spatie/laravel-permission ^7.3`. Published config + migration. Migration ran clean.
- Added `HasRoles` trait to `User` model.
- Installed `date-fns` + `date-fns-tz`.
- Updated `resources/js/lib/utils.ts`: added `formatInManila()`, `formatPHP()`, `formatDate()`, `MANILA_TZ` constant.
- Set `config/app.php` timezone to `Asia/Manila`.
- shadcn already configured (`components.json`); no setup needed.
- `php artisan migrate` clean.
