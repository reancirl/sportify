import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    LayoutGrid,
    ShieldCheck,
    Users as UsersIcon,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn, formatInManila } from '@/lib/utils';
import type { Models } from '@/types';

type Stats = {
    pending_venues: number;
    approved_venues: number;
    rejected_venues: number;
    total_members: number;
    new_members_this_week: number;
    total_bookings: number;
    bookings_this_week: number;
};

type PendingVenue = Pick<
    Models.Venue,
    'id' | 'slug' | 'name' | 'city' | 'province' | 'created_at'
> & {
    owner_id: string;
    owner?: { id: string; name: string; email: string } | null;
};

type Props = {
    stats: Stats;
    pending_venues: PendingVenue[];
};

export default function AdminDashboard({ stats, pending_venues }: Props) {
    return (
        <>
            <Head title="Super admin dashboard" />

            <div className="flex flex-1 flex-col gap-10 p-6">
                <Header />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiTile
                        eyebrow="Pending review"
                        value={stats.pending_venues}
                        caption="Venue submissions"
                        href="/admin/venues?status=pending"
                        cta="Review submissions"
                        highlight={stats.pending_venues > 0}
                        icon={ShieldCheck}
                    />
                    <KpiTile
                        eyebrow="Approved venues"
                        value={stats.approved_venues}
                        caption="Live on sportify.ph"
                        href="/admin/venues?status=approved"
                        cta="View approved"
                        icon={CheckCircle2}
                    />
                    <KpiTile
                        eyebrow="Members"
                        value={stats.total_members}
                        caption={`${stats.new_members_this_week} new this week`}
                        href="/admin/users"
                        cta="Browse users"
                        icon={UsersIcon}
                    />
                    <KpiTile
                        eyebrow="Bookings"
                        value={stats.total_bookings}
                        caption={`${stats.bookings_this_week} this week`}
                        icon={LayoutGrid}
                    />
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <PendingApprovalsPanel venues={pending_venues} />
                    <SystemPanel stats={stats} />
                </section>
            </div>
        </>
    );
}

function Header() {
    return (
        <header className="flex flex-col gap-3 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                    <ShieldCheck className="size-3.5 text-[#f37021]" />
                    Super admin
                </p>
                <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                    Dashboard
                </h1>
                <p className="font-serif text-sm text-[#5c3a21]">
                    A snapshot of sportify
                    <span className="italic text-[#f37021]">.ph</span> across
                    venues, members, and bookings.
                </p>
            </div>
        </header>
    );
}

type KpiTileProps = {
    eyebrow: string;
    value: number;
    caption: string;
    href?: string;
    cta?: string;
    highlight?: boolean;
    icon?: typeof ShieldCheck;
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
                    'font-display text-4xl font-bold leading-none tracking-[-0.02em]',
                    highlight ? 'text-[#f37021]' : 'text-[#3e2817]',
                )}
            >
                {value.toLocaleString()}
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

function PendingApprovalsPanel({ venues }: { venues: PendingVenue[] }) {
    return (
        <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
            <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Awaiting review
                </p>
                <Link
                    href="/admin/venues?status=pending"
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]"
                >
                    View all
                    <ArrowRight className="size-3" aria-hidden />
                </Link>
            </div>
            {venues.length === 0 ? (
                <div className="px-5 py-12 text-center font-serif text-sm text-[#5c3a21]">
                    Nothing pending. The queue is empty.
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-[#faf5ec]">
                        <TableRow className="border-[#3e2817]/12 hover:bg-[#faf5ec]">
                            <Th>Venue</Th>
                            <Th>Owner</Th>
                            <Th>City</Th>
                            <Th>Submitted</Th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues.map((venue) => (
                            <TableRow
                                key={venue.id}
                                className="border-[#3e2817]/10 transition-colors hover:bg-[#faf5ec]/60"
                            >
                                <TableCell className="px-4 py-3.5">
                                    <Link
                                        href="/admin/venues?status=pending"
                                        className="font-display text-sm font-semibold text-[#3e2817] transition hover:text-[#f37021]"
                                    >
                                        {venue.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-sm text-[#3e2817]">
                                    {venue.owner?.name ?? '—'}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-sm text-[#5c3a21]">
                                    {venue.city}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-sm text-[#5c3a21]">
                                    {formatInManila(venue.created_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

function SystemPanel({ stats }: { stats: Stats }) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-[#3e2817]/15 bg-[#3e2817] p-6 text-[#faf5ec]">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#faf5ec]/65">
                System
            </p>
            <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.01em]">
                Health at a glance.
            </h2>

            <dl className="mt-2 space-y-3 border-t border-[#faf5ec]/15 pt-4 font-serif text-sm">
                <Row
                    label="Approved venues"
                    value={stats.approved_venues.toLocaleString()}
                />
                <Row
                    label="Pending review"
                    value={stats.pending_venues.toLocaleString()}
                    accent={stats.pending_venues > 0}
                />
                <Row
                    label="Rejected venues"
                    value={stats.rejected_venues.toLocaleString()}
                />
                <Row
                    label="Total members"
                    value={stats.total_members.toLocaleString()}
                />
                <Row
                    label="Total bookings"
                    value={stats.total_bookings.toLocaleString()}
                />
            </dl>

            <p className="mt-auto flex items-center gap-2 pt-4 text-[10px] uppercase tracking-[0.22em] text-[#faf5ec]/55">
                <Clock className="size-3" aria-hidden />
                Last refreshed just now
            </p>
        </div>
    );
}

function Row({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="text-[#faf5ec]/75">{label}</dt>
            <dd
                className={cn(
                    'font-display font-semibold',
                    accent ? 'text-[#f37021]' : 'text-[#faf5ec]',
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <TableHead className="h-11 px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
            {children}
        </TableHead>
    );
}
