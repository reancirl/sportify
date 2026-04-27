import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Lock,
    Mail,
    MapPin,
    Phone,
    Users,
} from 'lucide-react';
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
import type { Models } from '@/types';

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
}: Props) {
    const { auth, sportify } = usePage().props;
    const user = auth.user;
    const { region } = sportify;
    const cover = venue.images?.[0]?.image_path ?? venue.cover_image_path ?? null;
    const metaDescription = venue.description
        ? venue.description.slice(0, 150)
        : `Reserve courts at ${venue.name} in ${region.city}. Book online in seconds.`;

    const bookHref = (courtId: string) =>
        user
            ? `/bookings/create?venue=${venue.id}&court=${courtId}`
            : `${login().url}?next=${encodeURIComponent(
                  `/bookings/create?venue=${venue.id}&court=${courtId}`,
              )}`;

    const slotHref = (courtId: string, startsAt: string) => {
        const next = `/bookings/create?venue=${venue.id}&court=${courtId}&starts_at=${encodeURIComponent(
            startsAt,
        )}`;

        return user
            ? next
            : `${login().url}?next=${encodeURIComponent(next)}`;
    };

    const switchDate = (date: string) => {
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
            <Head title={venue.name}>
                <meta name="description" content={metaDescription} />
            </Head>

            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
                {/* — Hero — */}
                <section
                    ref={heroRef}
                    className="overflow-hidden border border-chocolate/15 bg-white"
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
                                    className="size-12 text-chocolate-soft/35"
                                    aria-hidden
                                />
                            </div>
                        )}
                        {venue.status === 'approved' && (
                            <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 bg-cream/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-chocolate backdrop-blur">
                                <CheckCircle2
                                    className="size-3 text-hermes"
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
                            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-chocolate">
                                {venue.name}
                            </h1>
                            <p className="flex items-center gap-1.5 font-serif text-sm text-chocolate-soft">
                                <MapPin className="size-4" aria-hidden />
                                {venue.address_line}, {venue.city}, {venue.province}
                            </p>
                        </div>
                        {venue.courts && venue.courts.length > 0 && (
                            <Link
                                href={bookHref(venue.courts[0].id)}
                                className="inline-flex items-center justify-center gap-2 self-start bg-hermes px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:bg-hermes-deep sm:self-auto"
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
                                <p className="mt-3 font-serif text-base leading-relaxed text-chocolate">
                                    {venue.description}
                                </p>
                            </section>
                        )}

                        {/* Courts */}
                        <section
                            data-reveal
                            className="border border-chocolate/15 bg-white"
                        >
                            <div className="border-b border-chocolate/12 px-7 py-5">
                                <p className="editorial-label">The Courts</p>
                            </div>
                            <div className="px-7 py-2">
                                {!venue.courts || venue.courts.length === 0 ? (
                                    <p className="py-6 font-serif text-sm text-chocolate-soft">
                                        No courts published yet.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-chocolate/12">
                                        {venue.courts.map((court) => (
                                            <li
                                                key={court.id}
                                                className="flex items-start justify-between gap-4 py-5"
                                            >
                                                <div className="space-y-1.5">
                                                    <p className="font-display text-lg font-bold tracking-[-0.01em] text-chocolate">
                                                        {court.name}
                                                    </p>
                                                    {court.description && (
                                                        <p className="font-serif text-sm text-chocolate-soft">
                                                            {court.description}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-chocolate-soft">
                                                        {court.slot_minutes}-min slots
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className="font-display text-base font-semibold text-chocolate">
                                                        {formatPHP(court.hourly_rate)}
                                                        <span className="text-[10px] tracking-[0.18em] text-chocolate-soft">
                                                            {' '}
                                                            / HR
                                                        </span>
                                                    </span>
                                                    <Link
                                                        href={bookHref(court.id)}
                                                        className="inline-flex items-center gap-1.5 border border-chocolate px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-chocolate transition hover:bg-chocolate hover:text-cream"
                                                    >
                                                        Book
                                                        <ArrowRight
                                                            className="size-3"
                                                            aria-hidden
                                                        />
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        {/* Schedule */}
                        <ScheduleSection
                            schedule={schedule}
                            selectedDate={selectedDate}
                            dateOptions={dateOptions}
                            onSwitchDate={switchDate}
                            slotHref={slotHref}
                            isMember={!!user}
                        />

                        {/* Open play */}
                        <section
                            data-reveal
                            className="border border-chocolate/15 bg-white"
                        >
                            <div className="border-b border-chocolate/12 px-7 py-5">
                                <p className="editorial-label">
                                    Upcoming Open Play
                                </p>
                            </div>
                            <div className="px-7 py-2">
                                {upcomingSessions.length === 0 ? (
                                    <p className="py-6 font-serif text-sm text-chocolate-soft">
                                        No sessions scheduled.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-chocolate/12">
                                        {upcomingSessions.map((session) => (
                                            <li
                                                key={session.id}
                                                className="flex flex-wrap items-start justify-between gap-3 py-5"
                                            >
                                                <div className="space-y-1.5">
                                                    <p className="font-display text-lg font-bold tracking-[-0.01em] text-chocolate">
                                                        {session.title}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 font-serif text-sm text-chocolate-soft">
                                                        <Clock
                                                            className="size-3.5"
                                                            aria-hidden
                                                        />
                                                        {formatInManila(
                                                            session.starts_at,
                                                        )}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 font-serif text-sm text-chocolate-soft">
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
                                                    className="inline-flex items-center gap-1.5 border border-chocolate px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-chocolate transition hover:bg-chocolate hover:text-cream"
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
                        <Card className="rounded-none border-chocolate/15 bg-white shadow-none">
                            <CardHeader>
                                <CardTitle className="editorial-label !text-xs">
                                    Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 font-serif text-sm text-chocolate">
                                <p className="flex items-start gap-2">
                                    <MapPin
                                        className="mt-0.5 size-4 shrink-0 text-chocolate-soft"
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
                                            className="size-4 text-chocolate-soft"
                                            aria-hidden
                                        />
                                        <a
                                            href={`tel:${venue.contact_phone}`}
                                            className="hover:text-hermes"
                                        >
                                            {venue.contact_phone}
                                        </a>
                                    </p>
                                )}
                                {venue.contact_email && (
                                    <p className="flex items-center gap-2">
                                        <Mail
                                            className="size-4 text-chocolate-soft"
                                            aria-hidden
                                        />
                                        <a
                                            href={`mailto:${venue.contact_email}`}
                                            className="hover:text-hermes"
                                        >
                                            {venue.contact_email}
                                        </a>
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {venue.operating_hours &&
                            venue.operating_hours.length > 0 && (
                                <Card className="rounded-none border-chocolate/15 bg-white shadow-none">
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
                                        <ul className="divide-y divide-chocolate/12 font-serif text-sm">
                                            {venue.operating_hours.map((hour) => (
                                                <li
                                                    key={hour.id}
                                                    className="flex items-center justify-between py-2.5"
                                                >
                                                    <span className="text-chocolate">
                                                        {DAY_LABELS[hour.day_of_week] ??
                                                            `Day ${hour.day_of_week}`}
                                                    </span>
                                                    <span className="text-chocolate-soft">
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
                            <div className="border border-chocolate bg-chocolate p-7 text-cream">
                                <p className="editorial-label text-cream/65">
                                    Become a member
                                </p>
                                <p className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.01em]">
                                    Reserve in seconds.
                                </p>
                                <p className="mt-2 font-serif text-sm leading-relaxed text-cream/80">
                                    Create a free account to book this venue
                                    or join an open play session.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button
                                        asChild
                                        className="h-auto rounded-none bg-hermes px-5 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white shadow-none hover:bg-hermes-deep"
                                    >
                                        <Link href="/register">Sign up</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-auto rounded-none border-cream/40 bg-transparent px-5 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-cream shadow-none hover:bg-cream/10 hover:text-cream"
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
    onSwitchDate: (date: string) => void;
    slotHref: (courtId: string, startsAt: string) => string;
    isMember: boolean;
};

function ScheduleSection({
    schedule,
    selectedDate,
    dateOptions,
    onSwitchDate,
    slotHref,
    isMember,
}: ScheduleSectionProps) {
    const venueClosed = schedule.every((entry) => entry.slots.length === 0);

    return (
        <section
            data-reveal
            className="border border-chocolate/15 bg-white"
        >
            <div className="border-b border-chocolate/12 px-7 py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="editorial-label">The Schedule</p>
                        <p className="mt-1 font-serif text-sm text-chocolate-soft">
                            Browse open slots, then{' '}
                            {isMember ? 'reserve' : 'sign in to reserve'}.
                        </p>
                    </div>
                    {!isMember && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-chocolate-soft ring-1 ring-inset ring-chocolate/15">
                            <Lock className="size-3" aria-hidden />
                            Members only
                        </span>
                    )}
                </div>

                {/* Day picker */}
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
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
                                        ? 'border-chocolate bg-chocolate text-cream'
                                        : 'border-chocolate/15 bg-white text-chocolate hover:border-chocolate/35',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-[9px] uppercase tracking-[0.22em]',
                                        active
                                            ? 'text-cream/65'
                                            : 'text-chocolate-soft',
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
                </div>
            </div>

            {schedule.length === 0 ? (
                <p className="px-7 py-12 text-center font-serif text-sm text-chocolate-soft">
                    No active courts to schedule yet.
                </p>
            ) : venueClosed ? (
                <p className="px-7 py-12 text-center font-serif text-sm text-chocolate-soft">
                    The venue is closed on this day.
                </p>
            ) : (
                <ul className="divide-y divide-chocolate/10">
                    {schedule.map((entry) => (
                        <li key={entry.court.id} className="px-7 py-5">
                            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <p className="font-display text-base font-bold tracking-[-0.01em] text-chocolate">
                                        {entry.court.name}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-chocolate-soft">
                                        {entry.court.surface_type
                                            ? `${entry.court.surface_type} · `
                                            : ''}
                                        {entry.court.slot_minutes}-min slots
                                    </p>
                                </div>
                                <p className="font-display text-sm font-semibold text-chocolate">
                                    {formatPHP(entry.court.hourly_rate)}
                                    <span className="text-[10px] tracking-[0.18em] text-chocolate-soft">
                                        {' '}
                                        / HR
                                    </span>
                                </p>
                            </div>

                            {entry.slots.length === 0 ? (
                                <p className="font-serif text-sm text-chocolate-soft/75">
                                    Closed for this day.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                    {entry.slots.map((slot) => {
                                        if (!slot.available) {
                                            return (
                                                <span
                                                    key={slot.starts_at}
                                                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#efe6d4] text-[11px] font-medium uppercase tracking-[0.12em] text-chocolate-soft/55 line-through"
                                                    aria-label={`${slot.label} — booked`}
                                                >
                                                    {slot.label}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={slot.starts_at}
                                                href={slotHref(
                                                    entry.court.id,
                                                    slot.starts_at,
                                                )}
                                                className="group inline-flex h-9 items-center justify-center rounded-md border border-chocolate/20 bg-white text-[11px] font-medium tracking-[0.06em] text-chocolate transition hover:border-hermes hover:bg-hermes hover:text-white"
                                            >
                                                {slot.label}
                                            </Link>
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
