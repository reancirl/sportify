import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarRange,
    Clock,
    Search,
    Sparkles,
    Trophy,
    UsersRound,
} from 'lucide-react';
import { cn, formatInManila, formatPHP } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as bookingsIndex } from '@/routes/player/bookings';
import { index as sessionsIndex } from '@/routes/player/sessions';
import { index as venuesIndex } from '@/routes/venues';
import type { Models } from '@/types';

type Stats = {
    upcoming_bookings: number;
    completed_bookings: number;
    sessions_joined: number;
};

type UpcomingBooking = {
    id: string;
    court_id: string;
    starts_at: string;
    ends_at: string;
    status: Models.BookingStatus;
    total_amount: string | number;
    court?:
        | (Pick<Models.Court, 'id' | 'name' | 'venue_id'> & {
              venue?: Pick<Models.Venue, 'id' | 'name' | 'city' | 'slug'> | null;
          })
        | null;
};

type Props = {
    role?: 'player' | 'venue_owner' | 'super_admin' | string;
    stats?: Stats;
    upcoming_bookings?: UpcomingBooking[];
};

export default function Dashboard({
    role = 'player',
    stats = { upcoming_bookings: 0, completed_bookings: 0, sessions_joined: 0 },
    upcoming_bookings = [],
}: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-10 p-6">
                <header className="flex flex-col gap-3 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                            <Sparkles className="size-3.5 text-[#f37021]" />
                            Members area
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                            Welcome back
                            <span className="text-[#f37021]">.</span>
                        </h1>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            Reserve a court, join a session, and stay sharp.
                        </p>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-3">
                    <Stat
                        eyebrow="Upcoming"
                        value={stats.upcoming_bookings}
                        caption={
                            stats.upcoming_bookings === 1
                                ? 'Confirmed booking'
                                : 'Confirmed bookings'
                        }
                    />
                    <Stat
                        eyebrow="Played"
                        value={stats.completed_bookings}
                        caption={
                            stats.completed_bookings === 1
                                ? 'Match completed'
                                : 'Matches completed'
                        }
                    />
                    <Stat
                        eyebrow="Open play"
                        value={stats.sessions_joined}
                        caption={
                            stats.sessions_joined === 1
                                ? 'Session joined'
                                : 'Sessions joined'
                        }
                    />
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <UpcomingBookingsPanel bookings={upcoming_bookings} />
                    <QuickActionsPanel />
                </section>

                <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/65">
                    Signed in as <span className="font-medium">{role}</span>
                </p>
            </div>
        </>
    );
}

function Stat({
    eyebrow,
    value,
    caption,
}: {
    eyebrow: string;
    value: number;
    caption: string;
}) {
    return (
        <div className="flex flex-col gap-2 border border-[#3e2817]/15 bg-white p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                {eyebrow}
            </p>
            <p className="font-display text-4xl font-bold leading-none tracking-[-0.02em] text-[#3e2817]">
                {value.toLocaleString()}
            </p>
            <p className="font-serif text-sm text-[#5c3a21]">{caption}</p>
        </div>
    );
}

function UpcomingBookingsPanel({
    bookings,
}: {
    bookings: UpcomingBooking[];
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
            <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Your next reservations
                </p>
                <Link
                    href={bookingsIndex().url}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]"
                >
                    View all
                    <ArrowRight className="size-3" aria-hidden />
                </Link>
            </div>
            {bookings.length === 0 ? (
                <div className="space-y-4 px-5 py-12 text-center">
                    <p className="font-serif text-sm text-[#5c3a21]">
                        No upcoming bookings yet.
                    </p>
                    <Link
                        href={venuesIndex().url}
                        className="inline-flex items-center gap-2 bg-[#3e2817] px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-chocolate-deep"
                    >
                        Find a court
                        <ArrowRight className="size-3" aria-hidden />
                    </Link>
                </div>
            ) : (
                <ul className="divide-y divide-[#3e2817]/10">
                    {bookings.map((booking) => (
                        <li
                            key={booking.id}
                            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                        >
                            <div className="space-y-1">
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    {booking.court?.venue?.name ?? 'Venue'}
                                </p>
                                <p className="font-serif text-xs text-[#5c3a21]">
                                    {booking.court?.name ?? 'Court'} ·{' '}
                                    {booking.court?.venue?.city ?? ''}
                                </p>
                                <p className="flex items-center gap-1.5 pt-1 text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/85">
                                    <Clock className="size-3" aria-hidden />
                                    {formatInManila(booking.starts_at)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span
                                    className={cn(
                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset',
                                        booking.status === 'confirmed'
                                            ? 'bg-[#dcfce7] text-[#166534] ring-[#166534]/25'
                                            : 'bg-[#fef3c7] text-[#854d0e] ring-[#854d0e]/20',
                                    )}
                                >
                                    {booking.status.replace('_', ' ')}
                                </span>
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    {formatPHP(booking.total_amount)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function QuickActionsPanel() {
    return (
        <div className="grid gap-3">
            <ActionCard
                icon={Search}
                title="Find a court"
                copy="Browse curated venues and reserve in seconds."
                href={venuesIndex().url}
            />
            <ActionCard
                icon={UsersRound}
                title="Open play sessions"
                copy="Drop into sessions matched to your level."
                href={sessionsIndex().url}
            />
            <ActionCard
                icon={CalendarRange}
                title="My bookings"
                copy="Review payments, court details, and history."
                href={bookingsIndex().url}
            />
            <div className="flex items-center justify-between border border-[#3e2817]/15 bg-[#3e2817] px-5 py-4 text-[#faf5ec]">
                <div className="flex items-center gap-3">
                    <Trophy className="size-4 text-[#f37021]" aria-hidden />
                    <div>
                        <p className="font-display text-sm font-semibold">
                            Ranked play
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#faf5ec]/65">
                            Coming soon
                        </p>
                    </div>
                </div>
                <span className="rounded-full border border-[#faf5ec]/25 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.22em]">
                    Soon
                </span>
            </div>
        </div>
    );
}

function ActionCard({
    icon: Icon,
    title,
    copy,
    href,
}: {
    icon: typeof Search;
    title: string;
    copy: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-4 border border-[#3e2817]/15 bg-white px-5 py-4 transition hover:border-[#3e2817]/30"
        >
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center bg-[#faf5ec] text-[#3e2817]">
                <Icon className="size-4" aria-hidden />
            </span>
            <div className="flex-1 space-y-1">
                <p className="font-display text-sm font-semibold text-[#3e2817]">
                    {title}
                </p>
                <p className="font-serif text-xs leading-relaxed text-[#5c3a21]">
                    {copy}
                </p>
            </div>
            <ArrowRight
                className="mt-1 size-3.5 text-[#5c3a21]/60 transition group-hover:translate-x-0.5 group-hover:text-[#f37021]"
                aria-hidden
            />
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
