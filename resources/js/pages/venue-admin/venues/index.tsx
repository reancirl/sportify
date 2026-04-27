import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarRange,
    LayoutGrid,
    MapPin,
    Plus,
    Receipt,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { PaginationNav } from '@/components/pagination-nav';
import { cn } from '@/lib/utils';
import type { Models } from '@/types';

type VenueWithCounts = Models.Venue & {
    courts_count?: number;
};

type Props = {
    venues: Models.PaginatedResponse<VenueWithCounts>;
};

const STATUS_COPY: Record<Models.VenueStatus, { label: string; class: string }> = {
    pending: {
        label: 'Pending review',
        class: 'bg-[#fef3c7] text-[#854d0e] ring-[#854d0e]/20',
    },
    approved: {
        label: 'Approved',
        class: 'bg-[#dcfce7] text-[#166534] ring-[#166534]/25',
    },
    rejected: {
        label: 'Rejected',
        class: 'bg-[#fee2e2] text-[#991b1b] ring-[#991b1b]/25',
    },
    suspended: {
        label: 'Suspended',
        class: 'bg-[#efe6d4] text-[#5c3a21] ring-[#5c3a21]/25',
    },
};

export default function VenueAdminVenuesIndex({ venues }: Props) {
    return (
        <>
            <Head title="My venues" />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <header className="flex flex-col gap-4 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                            <Sparkles className="size-3.5 text-[#f37021]" />
                            Venue management
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                            My venues
                        </h1>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            Choose a venue to manage its courts, sessions,
                            bookings, and team.
                        </p>
                    </div>

                    <Link
                        href="/venue-admin/venues/create"
                        className="inline-flex items-center gap-2 self-start bg-[#3e2817] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-chocolate-deep"
                    >
                        <Plus className="size-3.5" aria-hidden />
                        Add venue
                    </Link>
                </header>

                {venues.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {venues.data.map((venue) => (
                            <VenueCard key={venue.id} venue={venue} />
                        ))}
                    </div>
                )}

                <PaginationNav paginated={venues} />
            </div>
        </>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#3e2817]/25 bg-white px-6 py-16 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                Get started
            </p>
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-[#3e2817]">
                Register your first venue
            </h2>
            <p className="max-w-md font-serif text-sm text-[#5c3a21]">
                Submit your venue details for review. Once approved, members
                across Iligan will be able to book your courts.
            </p>
            <Link
                href="/venue-admin/venues/create"
                className="mt-2 inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-chocolate-deep"
            >
                Create a venue
                <ArrowRight className="size-3.5" aria-hidden />
            </Link>
        </div>
    );
}

function VenueCard({ venue }: { venue: VenueWithCounts }) {
    const status = STATUS_COPY[venue.status];
    const cover = venue.cover_image_path ?? venue.images?.[0]?.image_path ?? null;
    const courtsCount = venue.courts_count ?? venue.courts?.length ?? 0;

    return (
        <article className="flex flex-col overflow-hidden border border-[#3e2817]/15 bg-white transition hover:border-[#3e2817]/30 hover:shadow-[0_25px_50px_-30px_rgba(62,40,23,0.25)]">
            <div className="relative aspect-[16/9] w-full bg-[#efe6d4]">
                {cover ? (
                    <img
                        src={cover}
                        alt={`${venue.name} cover`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#efe6d4] to-[#faf5ec] text-[#5c3a21]/40">
                        <MapPin className="size-10" aria-hidden />
                    </div>
                )}
                <span
                    className={cn(
                        'absolute left-4 top-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset backdrop-blur',
                        status.class,
                    )}
                >
                    {status.label}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold leading-tight tracking-[-0.01em] text-[#3e2817]">
                        {venue.name}
                    </h3>
                    <p className="flex items-center gap-1.5 font-serif text-sm text-[#5c3a21]">
                        <MapPin className="size-3.5" aria-hidden />
                        {venue.city}, {venue.province}
                    </p>
                </div>

                <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#3e2817]/10 pt-3 text-[11px] text-[#5c3a21]">
                    <div className="flex items-baseline gap-1">
                        <dt className="uppercase tracking-[0.18em]">Courts</dt>
                        <dd className="font-display text-sm font-semibold text-[#3e2817]">
                            {courtsCount}
                        </dd>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <dt className="uppercase tracking-[0.18em]">
                            Booking window
                        </dt>
                        <dd className="font-display text-sm font-semibold text-[#3e2817]">
                            {venue.advance_booking_weeks}w
                        </dd>
                    </div>
                </dl>

                <div className="mt-auto flex flex-col gap-2 border-t border-[#3e2817]/10 pt-4">
                    <Link
                        href={`/venue-admin/venues/${venue.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 bg-[#3e2817] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-chocolate-deep"
                    >
                        Manage venue
                        <ArrowRight className="size-3" aria-hidden />
                    </Link>

                    <div className="grid grid-cols-4 gap-1">
                        <QuickLink
                            label="Courts"
                            icon={LayoutGrid}
                            href={`/venue-admin/venues/${venue.id}/courts`}
                        />
                        <QuickLink
                            label="Sessions"
                            icon={UsersRound}
                            href={`/venue-admin/venues/${venue.id}/sessions`}
                        />
                        <QuickLink
                            label="Bookings"
                            icon={CalendarRange}
                            href={`/venue-admin/venues/${venue.id}/bookings`}
                        />
                        <QuickLink
                            label="Payments"
                            icon={Receipt}
                            href={`/venue-admin/venues/${venue.id}/payments`}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}

function QuickLink({
    label,
    icon: Icon,
    href,
}: {
    label: string;
    icon: typeof LayoutGrid;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col items-center gap-1 border border-[#3e2817]/12 px-2 py-2 text-center text-[#5c3a21] transition hover:border-[#3e2817]/30 hover:bg-[#faf5ec] hover:text-[#3e2817]"
        >
            <Icon className="size-3.5" aria-hidden />
            <span className="text-[9px] font-medium uppercase tracking-[0.18em]">
                {label}
            </span>
        </Link>
    );
}
