# Pikol — Pickleball Booking Platform (MVP)

Multi-venue pickleball booking marketplace for the Philippines. Court rental + open-play sessions, manual payment verification (no gateway), Super Admin venue approval workflow.

## Stack

- Laravel 13 + PHP 8.4 + Fortify (auth)
- Inertia.js v3 + React 19 + TypeScript (strict)
- shadcn/ui + Tailwind v4
- Spatie Laravel Permission (roles)
- PHPUnit (tests)
- SQLite by default; works with MySQL/Postgres

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite        # if using SQLite (default)
php artisan migrate:fresh --seed       # creates schema + demo data
php artisan storage:link               # for serving payment proofs
npm install
npm run dev                            # or `composer run dev`
```

The dev server uses Vite. In production, run `npm run build`.

## Seeded credentials

All passwords: `password`

| Role | Email |
|---|---|
| Super Admin | admin@pikol.test |
| Venue Owner (Manila) | owner1@pikol.test |
| Venue Owner (Cebu) | owner2@pikol.test |
| Venue Staff (Manila) | staff1@pikol.test |
| Venue Staff (Cebu) | staff2@pikol.test |
| Player 1 (beginner) | player1@pikol.test |
| Player 2 (intermediate) | player2@pikol.test |
| Player 3 (intermediate) | player3@pikol.test |
| Player 4 (advanced) | player4@pikol.test |
| Player 5 (pro) | player5@pikol.test |

## Roles

- `super_admin` — approves/rejects venues, sees everything
- `venue_owner` — manages their venues, courts, sessions, bookings, payments, staff
- `venue_staff` — verifies payments, manages bookings/sessions for their assigned venues
- `player` — books courts, joins open-play sessions, uploads payment proofs

## Domain at a glance

- **Booking**: player picks a court + 1-hour slot; system creates a `Booking` (pending_payment) + a `Payment` (pending). Player uploads a screenshot. Venue staff verifies, which flips Booking → confirmed.
- **Open-play session**: venue creates a session (skill range, fee, max players, blocked courts/time). Players join. Capacity hit → status flips to `full`. Courts in `court_ids` are blocked from regular booking during the session window.
- **Cancellation**: player can self-cancel up to 24h before start. Past that, only venue staff/owner can cancel.
- **Venue approval**: new venues are `pending` until super_admin approves.

## Architecture notes

- **UUIDs** on user-facing entities (venues, courts, bookings, sessions, payments). `User.id` is INT.
- **Polymorphic payments**: `payments.payable_type` + `payable_id` (UUID-compatible via `uuidMorphs`). One payment row per booking or session-player.
- **Money**: `decimal(10,2)` in DB, **string** in TypeScript. Never `number` on the frontend (float precision).
- **Datetimes**: stored UTC, ISO-8601 over the wire, formatted to Asia/Manila at the UI via `formatInManila()`.
- **Service classes** in `app/Services/{Booking,OpenPlay,Payment,Venue}/`. Controllers stay thin.
- **Domain exceptions** in `app/Exceptions/Domain/`.
- **Form Requests** in `app/Http/Requests/{domain}/`. `authorize()` always delegates to a Policy.
- **Policies** in `app/Policies/`. Super admin bypass via `Gate::before` in `AuthServiceProvider`.

## Queues

`QUEUE_CONNECTION=database`. Notifications (`Mail` + `Database` channels) are dispatched via the queue. Run a worker in a separate terminal:

```bash
php artisan queue:work
```

`MAIL_MAILER=log` by default — mail goes to `storage/logs/laravel.log`.

## Running tests

```bash
php artisan test --compact
```

Currently 75 / 75 passing (35 domain feature tests + 40 starter-kit auth/Fortify tests).

## Code style

```bash
vendor/bin/pint --dirty --format agent   # PHP
npm run lint:check                        # JS/TS
npm run types:check                       # tsc --noEmit
```

## Roadmap (out of MVP scope, schema is ready)

- **Queueing** — `session_players` table is shaped to support a future `session_queue` table for waitlists / first-come dispatch.
- **Player ranking** — `match_results` table + `users.elo_rating` are in place; ELO calculation, leaderboards, and a results-entry UI come next.
- **SMS notifications** — `// TODO: SMS` markers in every notification's `via()` method. Wire a provider like Semaphore or Twilio.
- **Real payment gateway** — Maya / GCash. Replace the screenshot upload + manual verify flow with a webhook.
- **Search / filtering polish** — current marketplace has a city filter only.

## Project agents

`.claude/agents/` contains six specialized subagent prompts (`laravel-architect`, `laravel-service-builder`, `api-contract-keeper`, `inertia-react-builder`, `code-reviewer`, `db-migration-guard`). The orchestration policy is in `CLAUDE.md`.
