import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarRange,
    Clock,
    LayoutGrid,
    Receipt,
    Sparkles,
    Users as UsersIcon,
} from 'lucide-react';
import { cn, formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Stats = {
    active_courts: number;
    total_courts: number;
    upcoming_bookings: number;
    pending_payments: number;
};

type Props = {
    venues: Pick<Models.Venue, 'id' | 'name' | 'slug' | 'status' | 'city'>[];
    stats: Stats;
    upcoming_sessions: (Pick<
        Models.OpenPlaySession,
        | 'id'
        | 'venue_id'
        | 'title'
        | 'starts_at'
        | 'ends_at'
        | 'max_players'
        | 'fee_per_player'
        | 'status'
    >)[];
    today_bookings: {
        id: string;
        court_id: string;
        user_id: string;
        starts_at: string;
        ends_at: string;
        court?: { id: string; name: string; venue_id: string } | null;
        user?: { id: string; name: string } | null;
    }[];
};

export default function VenueAdminDashboard({
    venues,
    stats,
    upcoming_sessions,
    today_bookings,
}: Props) {
    const primaryVenue = venues[0];
    const venueId = primaryVenue?.id;

    return (
        <>
            <Head title="Venue dashboard" />

            <div className="flex flex-1 flex-col gap-10 p-6">
                <Header venues={venues} />

                {!primaryVenue ? (
                    <EmptyState />
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <KpiTile
                                eyebrow="Courts active"
                                value={`${stats.active_courts} / ${stats.total_courts}`}
                                caption="Open for booking"
                                href={`/venue-admin/venues/${venueId}/courts`}
                                cta="Manage courts"
                                icon={LayoutGrid}
                            />
                            <KpiTile
                                eyebrow="Bookings"
                                value={stats.upcoming_bookings.toString()}
                                caption="Confirmed in the next 7 days"
                                href={`/venue-admin/venues/${venueId}/bookings`}
                                cta="View bookings"
                                icon={CalendarRange}
                            />
                            <KpiTile
                                eyebrow="Pending payments"
                                value={stats.pending_payments.toString()}
                                caption="Awaiting verification"
                                href={`/venue-admin/venues/${venueId}/payments`}
                                cta="Review payments"
                                highlight={stats.pending_payments > 0}
                                icon={Receipt}
                            />
                            <KpiTile
                                eyebrow="Open play"
                                value={upcoming_sessions.length.toString()}
                                caption="Upcoming sessions"
                                href={`/venue-admin/venues/${venueId}/sessions`}
                                cta="Manage sessions"
                                icon={UsersIcon}
                            />
                        </section>

                        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                            <TodayBookingsPanel
                                bookings={today_bookings}
                                venueId={venueId!}
                            />
                            <UpcomingSessionsPanel
                                sessions={upcoming_sessions}
                                venueId={venueId!}
                            />
                        </section>
                    </>
                )}
            </div>
        </>
    );
}

function Header({ venues }: { venues: Props['venues'] }) {
    const venueLabel =
        venues.length === 0
            ? null
            : venues.length === 1
              ? venues[0].name
              : `${venues.length} venues`;

    return (
        <header className="flex flex-col gap-3 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                    <Sparkles className="size-3.5 text-[#f37021]" />
                    Venue management
                </p>
                <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                    Dashboard
                </h1>
                {venueLabel && (
                    <p className="font-serif text-sm text-[#5c3a21]">
                        Showing activity for{' '}
                        <span className="font-semibold text-[#3e2817]">
                            {venueLabel}
                        </span>
                        .
                    </p>
                )}
            </div>
        </header>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#3e2817]/25 bg-white px-6 py-16 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                Get started
            </p>
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-[#3e2817]">
                Create your first venue
            </h2>
            <p className="max-w-md font-serif text-sm text-[#5c3a21]">
                Submit your venue details for review. Once approved, members
                across Iligan will be able to book your courts.
            </p>
            <Link
                href="/venue-admin/venues/create"
                className="mt-2 inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
            >
                Create a venue
                <ArrowRight className="size-3.5" aria-hidden />
            </Link>
        </div>
    );
}

type KpiTileProps = {
    eyebrow: string;
    value: string;
    caption: string;
    href?: string;
    cta?: string;
    highlight?: boolean;
    icon?: typeof CalendarRange;
};

function KpiTile({
    eyebrow,
    value,
    caption,
    href,
    cta,
    highlight,
    icon: Icon,
}: KpiTileProps) {
    const Wrapper: React.ElementType = href ? Link : 'div';
    const wrapperProps = href ? { href } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={cn(
                'group flex flex-col gap-4 border bg-white p-5 transition',
                highlight
                    ? 'border-[#f37021]/45 bg-[#f37021]/5'
                    : 'border-[#3e2817]/15 hover:border-[#3e2817]/30',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p
                    className={cn(
                        'text-[10px] font-medium uppercase tracking-[0.22em]',
                        highlight ? 'text-[#f37021]' : 'text-[#5c3a21]',
                    )}
                >
                    {eyebrow}
                </p>
                {Icon && (
                    <Icon
                        className={cn(
                            'size-4',
                            highlight ? 'text-[#f37021]' : 'text-[#5c3a21]/65',
                        )}
                        aria-hidden
                    />
                )}
            </div>
            <p
                className={cn(
                    'font-display text-3xl font-bold leading-none tracking-[-0.02em] sm:text-4xl',
                    highlight ? 'text-[#f37021]' : 'text-[#3e2817]',
                )}
            >
                {value}
            </p>
            <p className="font-serif text-sm text-[#5c3a21]">{caption}</p>
            {href && cta && (
                <span
                    className={cn(
                        'mt-auto inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] transition',
                        highlight
                            ? 'text-[#f37021]'
                            : 'text-[#3e2817] group-hover:text-[#f37021]',
                    )}
                >
                    {cta}
                    <ArrowRight className="size-3" aria-hidden />
                </span>
            )}
        </Wrapper>
    );
}

function TodayBookingsPanel({
    bookings,
    venueId,
}: {
    bookings: Props['today_bookings'];
    venueId: string;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
            <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Today's bookings
                </p>
                <Link
                    href={`/venue-admin/venues/${venueId}/bookings`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]"
                >
                    View all
                    <ArrowRight className="size-3" aria-hidden />
                </Link>
            </div>
            {bookings.length === 0 ? (
                <div className="px-5 py-12 text-center font-serif text-sm text-[#5c3a21]">
                    No confirmed bookings for today.
                </div>
            ) : (
                <ul className="divide-y divide-[#3e2817]/10">
                    {bookings.map((booking) => (
                        <li
                            key={booking.id}
                            className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                            <div className="space-y-1">
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    {booking.court?.name ?? 'Court'}
                                </p>
                                <p className="font-serif text-xs text-[#5c3a21]">
                                    {booking.user?.name ?? 'Member'}
                                </p>
                            </div>
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]">
                                <Clock className="size-3" aria-hidden />
                                {formatInManila(booking.starts_at)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function UpcomingSessionsPanel({
    sessions,
    venueId,
}: {
    sessions: Props['upcoming_sessions'];
    venueId: string;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
            <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Upcoming open play
                </p>
                <Link
                    href={`/venue-admin/venues/${venueId}/sessions`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]"
                >
                    Manage
                    <ArrowRight className="size-3" aria-hidden />
                </Link>
            </div>
            {sessions.length === 0 ? (
                <div className="px-5 py-12 text-center font-serif text-sm text-[#5c3a21]">
                    No sessions scheduled.
                </div>
            ) : (
                <ul className="divide-y divide-[#3e2817]/10">
                    {sessions.map((session) => (
                        <li
                            key={session.id}
                            className="space-y-2 px-5 py-4"
                        >
                            <p className="font-display text-sm font-semibold text-[#3e2817]">
                                {session.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5c3a21]">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3" aria-hidden />
                                    {formatInManila(session.starts_at)}
                                </span>
                                <span>·</span>
                                <span>
                                    {session.max_players} players ·{' '}
                                    {formatPHP(session.fee_per_player)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
