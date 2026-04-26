import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    Phone,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useReveal } from '@/hooks/use-reveal';
import { cn, formatInManila, formatPHP } from '@/lib/utils';
import { login } from '@/routes';
import type { Models, User } from '@/types';

type SessionWithCount = Models.OpenPlaySession & {
    players_count?: number;
};

type ScheduleSlot = {
    starts_at: string;
    ends_at: string;
    label: string;
    available: boolean;
};

type ScheduleEntry = {
    court: {
        id: string;
        name: string;
        surface_type: string | null;
        hourly_rate: string;
        slot_minutes: number;
    };
    slots: ScheduleSlot[];
};

type DateOption = {
    date: string;
    day_label: string;
    weekday: string;
};

type Props = {
    venue: Models.Venue;
    upcomingSessions: SessionWithCount[];
    schedule: ScheduleEntry[];
    selectedDate: string;
    dateOptions: DateOption[];
    earliestDate: string;
    latestDate: string;
};

const DAY_LABELS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export default function PublicVenueShow({
    venue,
    upcomingSessions,
    schedule,
    selectedDate,
    dateOptions,
    earliestDate,
    latestDate,
}: Props) {
    const { auth } = usePage().props;
    const user = (auth as { user: User | null }).user;
    const cover = venue.images?.[0]?.image_path ?? venue.cover_image_path ?? null;

    const bookHref = (courtId: string) =>
        user
            ? `/bookings/create?venue=${venue.id}&court=${courtId}`
            : `${login().url}?next=${encodeURIComponent(
                  `/bookings/create?venue=${venue.id}&court=${courtId}`,
              )}`;

    const buildBookingHref = (
        courtId: string,
        startsAt: string,
        slotCount: number,
    ) =>
        `/checkout?venue=${venue.id}&court=${courtId}&starts_at=${encodeURIComponent(
            startsAt,
        )}&slot_count=${slotCount}`;

    const switchDate = (date: string) => {
        if (!date || date < earliestDate || date > latestDate) {
            return;
        }

        router.get(
            `/venues/${venue.slug}`,
            { date },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['schedule', 'selectedDate'],
                replace: true,
            },
        );
    };

    const heroRef = useReveal<HTMLElement>({
        scroll: false,
        stagger: 0.08,
        y: 24,
    });
    const mainRef = useReveal<HTMLDivElement>({
        stagger: 0.1,
        y: 24,
        start: 'top 90%',
    });

    return (
        <>
            <Head title={venue.name} />

            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
                {/* — Hero — */}
                <section
                    ref={heroRef}
                    className="overflow-hidden border border-[#3e2817]/15 bg-white"
                >
                    <div data-reveal className="relative aspect-[21/9] w-full bg-[#efe6d4]">
                        {cover ? (
                            <img
                                src={cover}
                                alt={`${venue.name} cover`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#efe6d4]">
                                <MapPin
                                    className="size-12 text-[#5c3a21]/35"
                                    aria-hidden
                                />
                            </div>
                        )}
                        {venue.status === 'approved' && (
                            <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 bg-[#faf5ec]/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] backdrop-blur">
                                <CheckCircle2
                                    className="size-3 text-[#f37021]"
                                    aria-hidden
                                />
                                Verified Venue
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-6 px-7 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-10">
                        <div data-reveal className="space-y-3">
                            <p className="editorial-label">
                                {venue.city}, {venue.province}
                            </p>
                            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#3e2817]">
                                {venue.name}
                            </h1>
                            <p className="flex items-center gap-1.5 font-serif text-sm text-[#5c3a21]">
                                <MapPin className="size-4" aria-hidden />
                                {venue.address_line}, {venue.city}, {venue.province}
                            </p>
                        </div>
                        {venue.courts && venue.courts.length > 0 && (
                            <Link
                                href={bookHref(venue.courts[0].id)}
                                className="inline-flex items-center justify-center gap-2 self-start bg-[#f37021] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:bg-[#d85a14] sm:self-auto"
                            >
                                Reserve a court
                                <ArrowRight className="size-3.5" aria-hidden />
                            </Link>
                        )}
                    </div>
                </section>

                <div
                    ref={mainRef}
                    className="grid gap-8 lg:grid-cols-[2fr_1fr]"
                >
                    <div className="space-y-8">
                        {venue.description && (
                            <section data-reveal>
                                <p className="editorial-label">About</p>
                                <p className="mt-3 font-serif text-base leading-relaxed text-[#3e2817]">
                                    {venue.description}
                                </p>
                            </section>
                        )}

                        {/* Schedule */}
                        <ScheduleSection
                            key={selectedDate}
                            schedule={schedule}
                            selectedDate={selectedDate}
                            dateOptions={dateOptions}
                            earliestDate={earliestDate}
                            latestDate={latestDate}
                            advanceWeeks={venue.advance_booking_weeks}
                            onSwitchDate={switchDate}
                            buildBookingHref={buildBookingHref}
                        />

                        {/* Open play */}
                        <section
                            data-reveal
                            className="border border-[#3e2817]/15 bg-white"
                        >
                            <div className="border-b border-[#3e2817]/12 px-7 py-5">
                                <p className="editorial-label">
                                    Upcoming Open Play
                                </p>
                            </div>
                            <div className="px-7 py-2">
                                {upcomingSessions.length === 0 ? (
                                    <p className="py-6 font-serif text-sm text-[#5c3a21]">
                                        No sessions scheduled.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-[#3e2817]/12">
                                        {upcomingSessions.map((session) => (
                                            <li
                                                key={session.id}
                                                className="flex flex-wrap items-start justify-between gap-3 py-5"
                                            >
                                                <div className="space-y-1.5">
                                                    <p className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                                                        {session.title}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 font-serif text-sm text-[#5c3a21]">
                                                        <Clock
                                                            className="size-3.5"
                                                            aria-hidden
                                                        />
                                                        {formatInManila(
                                                            session.starts_at,
                                                        )}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 font-serif text-sm text-[#5c3a21]">
                                                        <Users
                                                            className="size-3.5"
                                                            aria-hidden
                                                        />
                                                        {session.players_count ?? 0} /{' '}
                                                        {session.max_players}{' '}
                                                        players ·{' '}
                                                        {formatPHP(
                                                            session.fee_per_player,
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={
                                                        user
                                                            ? `/sessions/${session.id}`
                                                            : `${login().url}?next=${encodeURIComponent(`/sessions/${session.id}`)}`
                                                    }
                                                    className="inline-flex items-center gap-1.5 border border-[#3e2817] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition hover:bg-[#3e2817] hover:text-[#faf5ec]"
                                                >
                                                    View
                                                    <ArrowRight
                                                        className="size-3"
                                                        aria-hidden
                                                    />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside data-reveal className="space-y-6">
                        <Card className="rounded-none border-[#3e2817]/15 bg-white shadow-none">
                            <CardHeader>
                                <CardTitle className="editorial-label !text-xs">
                                    Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 font-serif text-sm text-[#3e2817]">
                                <p className="flex items-start gap-2">
                                    <MapPin
                                        className="mt-0.5 size-4 shrink-0 text-[#5c3a21]"
                                        aria-hidden
                                    />
                                    <span>
                                        {venue.address_line}
                                        <br />
                                        {venue.city}, {venue.province}, {venue.region}
                                    </span>
                                </p>
                                {venue.contact_phone && (
                                    <p className="flex items-center gap-2">
                                        <Phone
                                            className="size-4 text-[#5c3a21]"
                                            aria-hidden
                                        />
                                        <a
                                            href={`tel:${venue.contact_phone}`}
                                            className="hover:text-[#f37021]"
                                        >
                                            {venue.contact_phone}
                                        </a>
                                    </p>
                                )}
                                {venue.contact_email && (
                                    <p className="flex items-center gap-2">
                                        <Mail
                                            className="size-4 text-[#5c3a21]"
                                            aria-hidden
                                        />
                                        <a
                                            href={`mailto:${venue.contact_email}`}
                                            className="hover:text-[#f37021]"
                                        >
                                            {venue.contact_email}
                                        </a>
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {venue.operating_hours &&
                            venue.operating_hours.length > 0 && (
                                <Card className="rounded-none border-[#3e2817]/15 bg-white shadow-none">
                                    <CardHeader>
                                        <CardTitle className="editorial-label !text-xs flex items-center gap-2">
                                            <Calendar
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                            Operating hours
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="divide-y divide-[#3e2817]/12 font-serif text-sm">
                                            {venue.operating_hours.map((hour) => (
                                                <li
                                                    key={hour.id}
                                                    className="flex items-center justify-between py-2.5"
                                                >
                                                    <span className="text-[#3e2817]">
                                                        {DAY_LABELS[hour.day_of_week] ??
                                                            `Day ${hour.day_of_week}`}
                                                    </span>
                                                    <span className="text-[#5c3a21]">
                                                        {hour.is_closed
                                                            ? 'Closed'
                                                            : `${hour.opens_at?.slice(0, 5) ?? '—'} – ${hour.closes_at?.slice(0, 5) ?? '—'}`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                        {!user && (
                            <div className="border border-[#3e2817] bg-[#3e2817] p-7 text-[#faf5ec]">
                                <p className="editorial-label text-[#faf5ec]/65">
                                    Become a member
                                </p>
                                <p className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.01em]">
                                    Reserve in seconds.
                                </p>
                                <p className="mt-2 font-serif text-sm leading-relaxed text-[#faf5ec]/80">
                                    Create a free account to book this venue
                                    or join an open play session.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button
                                        asChild
                                        className="h-auto rounded-none bg-[#f37021] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white shadow-none hover:bg-[#d85a14]"
                                    >
                                        <Link href="/register">Sign up</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-auto rounded-none border-[#faf5ec]/40 bg-transparent px-5 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#faf5ec]/10 hover:text-[#faf5ec]"
                                    >
                                        <Link href={login().url}>Log in</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

/* ── Schedule section ───────────────────────────────────────────────── */

type ScheduleSectionProps = {
    schedule: ScheduleEntry[];
    selectedDate: string;
    dateOptions: DateOption[];
    earliestDate: string;
    latestDate: string;
    advanceWeeks: number;
    onSwitchDate: (date: string) => void;
    buildBookingHref: (
        courtId: string,
        startsAt: string,
        slotCount: number,
    ) => string;
};

const MAX_SLOT_COUNT = 8;

function ScheduleSection({
    schedule,
    selectedDate,
    dateOptions,
    earliestDate,
    latestDate,
    advanceWeeks,
    onSwitchDate,
    buildBookingHref,
}: ScheduleSectionProps) {
    const venueClosed = schedule.every((entry) => entry.slots.length === 0);
    const isCustomDate = !dateOptions.some((d) => d.date === selectedDate);
    const customDateLabel = formatPickedDate(selectedDate);

    // Multi-select state: which court + which slot indices on it.
    const [selection, setSelection] = useState<{
        courtId: string;
        indices: number[];
    } | null>(null);

    const selectedEntry = useMemo(
        () =>
            selection
                ? (schedule.find((e) => e.court.id === selection.courtId) ?? null)
                : null,
        [selection, schedule],
    );

    const toggleSlot = (courtId: string, index: number, available: boolean) => {
        if (!available) {
            return;
        }

        setSelection((prev) => {
            // Different court → start fresh.
            if (!prev || prev.courtId !== courtId) {
                return { courtId, indices: [index] };
            }

            // Same slot → deselect it.
            if (prev.indices.includes(index)) {
                const next = prev.indices.filter((i) => i !== index);

                return next.length === 0 ? null : { courtId, indices: next };
            }

            // Cap reached.
            if (prev.indices.length >= MAX_SLOT_COUNT) {
                return prev;
            }

            const min = Math.min(...prev.indices);
            const max = Math.max(...prev.indices);

            // Must extend the existing contiguous run at either end.
            if (index === min - 1 || index === max + 1) {
                return {
                    courtId,
                    indices: [...prev.indices, index].sort((a, b) => a - b),
                };
            }

            // Non-adjacent → replace selection with just the new slot.
            return { courtId, indices: [index] };
        });
    };

    const clearSelection = () => setSelection(null);

    return (
        <section
            data-reveal
            className="border border-[#3e2817]/15 bg-white"
        >
            {selection && selectedEntry && (
                <SelectionBar
                    entry={selectedEntry}
                    indices={selection.indices}
                    onClear={clearSelection}
                    buildBookingHref={buildBookingHref}
                />
            )}

            <div className="border-b border-[#3e2817]/12 px-7 py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="editorial-label">The Schedule</p>
                        <p className="mt-1 font-serif text-sm text-[#5c3a21]">
                            Browse open slots, then reserve in seconds — no
                            account needed.
                        </p>
                    </div>
                </div>

                {/* Day picker — quick tabs for the next ~week, plus a date input
                    for jumping further out (up to advance_booking_weeks). */}
                <div className="mt-5 flex flex-wrap items-stretch gap-2">
                    {dateOptions.map((option) => {
                        const active = option.date === selectedDate;

                        return (
                            <button
                                key={option.date}
                                type="button"
                                onClick={() => onSwitchDate(option.date)}
                                className={cn(
                                    'flex min-w-[78px] flex-col items-start rounded-md border px-3 py-2 text-left transition',
                                    active
                                        ? 'border-[#3e2817] bg-[#3e2817] text-[#faf5ec]'
                                        : 'border-[#3e2817]/15 bg-white text-[#3e2817] hover:border-[#3e2817]/35',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-[9px] uppercase tracking-[0.22em]',
                                        active
                                            ? 'text-[#faf5ec]/65'
                                            : 'text-[#5c3a21]',
                                    )}
                                >
                                    {option.weekday}
                                </span>
                                <span className="font-display text-sm font-bold tracking-[-0.01em]">
                                    {option.day_label}
                                </span>
                            </button>
                        );
                    })}

                    <label
                        className={cn(
                            'flex min-w-[160px] cursor-pointer flex-col items-start rounded-md border px-3 py-2 text-left transition',
                            isCustomDate
                                ? 'border-[#3e2817] bg-[#3e2817] text-[#faf5ec]'
                                : 'border-dashed border-[#3e2817]/30 bg-white text-[#3e2817] hover:border-[#3e2817]/50',
                        )}
                    >
                        <span
                            className={cn(
                                'flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em]',
                                isCustomDate
                                    ? 'text-[#faf5ec]/65'
                                    : 'text-[#5c3a21]',
                            )}
                        >
                            <Calendar className="size-3" aria-hidden />
                            Pick a date
                        </span>
                        <input
                            type="date"
                            value={selectedDate}
                            min={earliestDate}
                            max={latestDate}
                            onChange={(e) => onSwitchDate(e.target.value)}
                            className={cn(
                                'mt-0.5 cursor-pointer bg-transparent font-display text-sm font-bold tracking-[-0.01em] outline-none',
                                isCustomDate
                                    ? 'text-[#faf5ec] [color-scheme:dark]'
                                    : 'text-[#3e2817]',
                            )}
                        />
                    </label>
                </div>

                <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/65">
                    Bookable up to {advanceWeeks}{' '}
                    {advanceWeeks === 1 ? 'week' : 'weeks'} ahead
                    {isCustomDate && customDateLabel
                        ? ` · Showing ${customDateLabel}`
                        : ''}
                </p>
            </div>

            {schedule.length === 0 ? (
                <p className="px-7 py-12 text-center font-serif text-sm text-[#5c3a21]">
                    No active courts to schedule yet.
                </p>
            ) : venueClosed ? (
                <p className="px-7 py-12 text-center font-serif text-sm text-[#5c3a21]">
                    The venue is closed on this day.
                </p>
            ) : (
                <ul className="divide-y divide-[#3e2817]/10">
                    {schedule.map((entry) => (
                        <li key={entry.court.id} className="px-7 py-5">
                            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <p className="font-display text-base font-bold tracking-[-0.01em] text-[#3e2817]">
                                        {entry.court.name}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]">
                                        {entry.court.surface_type
                                            ? `${entry.court.surface_type} · `
                                            : ''}
                                        {entry.court.slot_minutes}-min slots
                                    </p>
                                </div>
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    {formatPHP(entry.court.hourly_rate)}
                                    <span className="text-[10px] tracking-[0.18em] text-[#5c3a21]">
                                        {' '}
                                        / HR
                                    </span>
                                </p>
                            </div>

                            {entry.slots.length === 0 ? (
                                <p className="font-serif text-sm text-[#5c3a21]/75">
                                    Closed for this day.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                    {entry.slots.map((slot, idx) => {
                                        if (!slot.available) {
                                            return (
                                                <span
                                                    key={slot.starts_at}
                                                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#efe6d4] text-[11px] font-medium uppercase tracking-[0.12em] text-[#5c3a21]/55 line-through"
                                                    aria-label={`${slot.label} — booked`}
                                                >
                                                    {slot.label}
                                                </span>
                                            );
                                        }

                                        const isSelected =
                                            selection?.courtId === entry.court.id &&
                                            selection.indices.includes(idx);
                                        const otherCourtSelected =
                                            selection !== null &&
                                            selection.courtId !== entry.court.id;

                                        return (
                                            <button
                                                key={slot.starts_at}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() =>
                                                    toggleSlot(
                                                        entry.court.id,
                                                        idx,
                                                        slot.available,
                                                    )
                                                }
                                                className={cn(
                                                    'inline-flex h-9 items-center justify-center rounded-md border text-[11px] font-medium tracking-[0.06em] transition',
                                                    isSelected
                                                        ? 'border-[#f37021] bg-[#f37021] text-white shadow-[0_4px_10px_-4px_rgba(243,112,33,0.5)]'
                                                        : otherCourtSelected
                                                          ? 'border-[#3e2817]/15 bg-white text-[#3e2817]/40 hover:border-[#3e2817]/35 hover:text-[#3e2817]'
                                                          : 'border-[#3e2817]/20 bg-white text-[#3e2817] hover:border-[#f37021] hover:bg-[#f37021]/10',
                                                )}
                                            >
                                                {slot.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/**
 * Render a YYYY-MM-DD as a readable label like "Wed, Apr 30, 2026".
 * Avoids timezone surprises by parsing the date as a local-time midnight.
 */
function formatPickedDate(date: string): string {
    if (!date) {
        return '';
    }

    const [year, month, day] = date.split('-').map(Number);

    if (!year || !month || !day) {
        return date;
    }

    return new Date(year, month - 1, day).toLocaleDateString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/* ── Selection bar ─────────────────────────────────────────────────── */

type SelectionBarProps = {
    entry: ScheduleEntry;
    indices: number[];
    onClear: () => void;
    buildBookingHref: (
        courtId: string,
        startsAt: string,
        slotCount: number,
    ) => string;
};

function SelectionBar({
    entry,
    indices,
    onClear,
    buildBookingHref,
}: SelectionBarProps) {
    const sorted = [...indices].sort((a, b) => a - b);
    const firstIdx = sorted[0];
    const lastIdx = sorted[sorted.length - 1];
    const firstSlot = entry.slots[firstIdx];
    const lastSlot = entry.slots[lastIdx];

    if (!firstSlot || !lastSlot) {
        return null;
    }

    const slotCount = sorted.length;
    const slotMinutes = entry.court.slot_minutes;
    const totalMinutes = slotCount * slotMinutes;
    const hours = totalMinutes / 60;
    const total = parseFloat(entry.court.hourly_rate) * hours;

    const endsLabel = new Date(lastSlot.ends_at).toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Manila',
    });

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f37021]/30 bg-[#f37021]/8 px-7 py-4">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onClear}
                    aria-label="Clear selection"
                    className="flex size-7 items-center justify-center rounded-full border border-[#3e2817]/20 bg-white text-[#3e2817] transition hover:border-[#3e2817]/40 hover:text-[#991b1b]"
                >
                    <X className="size-3.5" aria-hidden />
                </button>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                        {entry.court.name} ·{' '}
                        {hours === 1 ? '1 hour' : `${hours} hours`} ·{' '}
                        {slotCount} {slotCount === 1 ? 'slot' : 'slots'}
                    </p>
                    <p className="font-display text-base font-bold tracking-[-0.01em] text-[#3e2817]">
                        {firstSlot.label} – {endsLabel}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <p className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                    {formatPHP(total)}
                </p>
                <Link
                    href={buildBookingHref(
                        entry.court.id,
                        firstSlot.starts_at,
                        slotCount,
                    )}
                    className="inline-flex items-center gap-2 bg-[#3e2817] px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                >
                    Proceed to checkout
                    <ArrowRight className="size-3" aria-hidden />
                </Link>
            </div>
        </div>
    );
}
