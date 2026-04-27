import { Link } from '@inertiajs/react';
import {
    CalendarRange,
    CheckCircle2,
    LayoutGrid,
    MapPin,
    Pencil,
    Receipt,
    Users,
    UsersRound,
    Wallet,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venue: Pick<Models.Venue, 'id' | 'name' | 'slug' | 'city' | 'province' | 'status'>;
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

/**
 * Venue-scoped sub-navigation. Renders at the top of every per-venue
 * management page so owners always know which venue they're acting on, and
 * can jump between its sub-resources without losing context.
 */
export function VenueSubNav({ venue }: Props) {
    const { isCurrentUrl } = useCurrentUrl();

    const tabs = [
        {
            href: `/venue-admin/venues/${venue.id}/edit`,
            label: 'Overview',
            icon: Pencil,
        },
        {
            href: `/venue-admin/venues/${venue.id}/courts`,
            label: 'Courts',
            icon: LayoutGrid,
        },
        {
            href: `/venue-admin/venues/${venue.id}/sessions`,
            label: 'Sessions',
            icon: UsersRound,
        },
        {
            href: `/venue-admin/venues/${venue.id}/bookings`,
            label: 'Bookings',
            icon: CalendarRange,
        },
        {
            href: `/venue-admin/venues/${venue.id}/payments`,
            label: 'Payments',
            icon: Receipt,
        },
        {
            href: `/venue-admin/venues/${venue.id}/payment-methods`,
            label: 'Payment setup',
            icon: Wallet,
        },
        {
            href: `/venue-admin/venues/${venue.id}/staff`,
            label: 'Staff',
            icon: Users,
        },
    ];

    const status = STATUS_COPY[venue.status];

    return (
        <header className="space-y-5 border-b border-[#3e2817]/12 pb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <Link
                        href="/venue-admin/venues"
                        className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21] transition hover:text-[#f37021]"
                    >
                        ← My venues
                    </Link>
                    <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.01em] text-[#3e2817]">
                        {venue.name}
                    </h1>
                    <p className="flex items-center gap-2 font-serif text-sm text-[#5c3a21]">
                        <MapPin className="size-3.5" aria-hidden />
                        {venue.city}, {venue.province}
                    </p>
                </div>

                <span
                    className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ring-1 ring-inset',
                        status.class,
                    )}
                >
                    {venue.status === 'approved' && (
                        <CheckCircle2 className="size-3" aria-hidden />
                    )}
                    {status.label}
                </span>
            </div>

            <nav
                aria-label="Venue sections"
                className="-mx-2 flex flex-wrap gap-1 overflow-x-auto"
            >
                {tabs.map((tab) => {
                    const isActive = isCurrentUrl(tab.href, undefined, true);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            prefetch
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] transition',
                                isActive
                                    ? 'bg-[#3e2817] text-[#faf5ec]'
                                    : 'text-[#5c3a21] hover:bg-[#3e2817]/5 hover:text-[#3e2817]',
                            )}
                        >
                            <tab.icon className="size-3.5" aria-hidden />
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}
