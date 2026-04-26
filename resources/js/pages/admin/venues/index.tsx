import { Head, router, useForm } from '@inertiajs/react';
import {
    Check,
    MoreHorizontal,
    PauseCircle,
    PlayCircle,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { PaginationNav } from '@/components/pagination-nav';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatInManila } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venues: Models.PaginatedResponse<Models.Venue>;
    filters: {
        status: Models.VenueStatus | null;
    };
};

const STATUSES: Models.VenueStatus[] = [
    'pending',
    'approved',
    'rejected',
    'suspended',
];

const STATUS_LABEL: Record<Models.VenueStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
};

const STATUS_PILL_CLASS: Record<Models.VenueStatus, string> = {
    pending: 'bg-[#fef3c7] text-[#854d0e] ring-1 ring-inset ring-[#854d0e]/20',
    approved:
        'bg-[#dcfce7] text-[#166534] ring-1 ring-inset ring-[#166534]/25',
    rejected:
        'bg-[#fee2e2] text-[#991b1b] ring-1 ring-inset ring-[#991b1b]/25',
    suspended:
        'bg-[#efe6d4] text-[#5c3a21] ring-1 ring-inset ring-[#5c3a21]/25',
};

function StatusPill({ status }: { status: Models.VenueStatus }) {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]',
                STATUS_PILL_CLASS[status],
            )}
        >
            {STATUS_LABEL[status]}
        </span>
    );
}

type ActionKind = 'reject' | 'suspend';

type ReasonDialogState = {
    open: boolean;
    kind: ActionKind | null;
    venue: Models.Venue | null;
};

const REASON_COPY: Record<
    ActionKind,
    {
        title: string;
        description: string;
        endpoint: (venueId: string) => string;
        field: 'rejection_reason' | 'suspension_reason';
        cta: string;
        ctaClass: string;
    }
> = {
    reject: {
        title: 'Reject this venue',
        description:
            'Reject the submission. The owner will see this reason and can address it before resubmitting.',
        endpoint: (id) => `/admin/venues/${id}/reject`,
        field: 'rejection_reason',
        cta: 'Reject venue',
        ctaClass: 'bg-[#991b1b] hover:bg-[#7f1d1d] text-white',
    },
    suspend: {
        title: 'Suspend this venue',
        description:
            'Suspend the venue. It will be hidden from public listings until reinstated.',
        endpoint: (id) => `/admin/venues/${id}/suspend`,
        field: 'suspension_reason',
        cta: 'Suspend venue',
        ctaClass: 'bg-[#5c3a21] hover:bg-[#3e2817] text-[#faf5ec]',
    },
};

export default function AdminVenuesIndex({ venues, filters }: Props) {
    const [status, setStatus] = useState<Models.VenueStatus | 'all'>(
        filters.status ?? 'all',
    );
    const [reasonDialog, setReasonDialog] = useState<ReasonDialogState>({
        open: false,
        kind: null,
        venue: null,
    });

    const applyStatus = (next: Models.VenueStatus | 'all') => {
        setStatus(next);
        router.get(
            '/admin/venues',
            { status: next === 'all' ? undefined : next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const counts = venues.data.reduce(
        (acc, v) => {
            acc[v.status] = (acc[v.status] ?? 0) + 1;

            return acc;
        },
        {} as Record<Models.VenueStatus, number>,
    );

    const openReasonDialog = (kind: ActionKind, venue: Models.Venue) =>
        setReasonDialog({ open: true, kind, venue });

    const closeReasonDialog = () =>
        setReasonDialog((s) => ({ ...s, open: false }));

    return (
        <>
            <Head title="Venue approvals" />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <header className="flex flex-col gap-4 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                            <ShieldCheck className="size-3.5 text-[#f37021]" />
                            Super admin
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                            Venue approvals
                        </h1>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            Review submissions, approve listings, suspend
                            venues, or reinstate them — change a venue's
                            status from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Stat
                            label="On this page"
                            value={venues.data.length.toString()}
                        />
                        <Stat
                            label="Pending review"
                            value={(counts.pending ?? 0).toString()}
                            highlight
                        />
                        <Stat label="Total" value={venues.total.toString()} />
                    </div>
                </header>

                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                        Filter
                    </span>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            applyStatus(value as Models.VenueStatus | 'all')
                        }
                    >
                        <SelectTrigger className="h-9 w-44 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {STATUS_LABEL[s]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {venues.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[#3e2817]/20 bg-white py-16 text-center">
                        <p className="font-serif text-sm text-[#5c3a21]">
                            No venues match this filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
                        <Table>
                            <TableHeader className="bg-[#faf5ec]">
                                <TableRow className="border-[#3e2817]/12 hover:bg-[#faf5ec]">
                                    <Th>Venue</Th>
                                    <Th>Owner</Th>
                                    <Th>City</Th>
                                    <Th>Submitted</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">Actions</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {venues.data.map((venue) => (
                                    <TableRow
                                        key={venue.id}
                                        className="border-[#3e2817]/10 transition-colors hover:bg-[#faf5ec]/60"
                                    >
                                        <TableCell className="px-4 py-4">
                                            <p className="font-display text-sm font-semibold text-[#3e2817]">
                                                {venue.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-[#5c3a21]/80">
                                                {venue.slug}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#3e2817]">
                                            {venue.owner?.name ??
                                                `User #${venue.owner_id}`}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#3e2817]">
                                            {venue.city}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#5c3a21]">
                                            {formatInManila(venue.created_at)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <StatusPill status={venue.status} />
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right">
                                            <ActionsMenu
                                                venue={venue}
                                                onAskReason={openReasonDialog}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <PaginationNav paginated={venues} />
            </div>

            <ReasonDialog
                state={reasonDialog}
                onClose={closeReasonDialog}
            />
        </>
    );
}

type ActionsMenuProps = {
    venue: Models.Venue;
    onAskReason: (kind: ActionKind, venue: Models.Venue) => void;
};

function ActionsMenu({ venue, onAskReason }: ActionsMenuProps) {
    const approveForm = useForm({});
    const reinstateForm = useForm({});

    const approve = () =>
        approveForm.post(`/admin/venues/${venue.id}/approve`, {
            preserveScroll: true,
        });

    const reinstate = () =>
        reinstateForm.post(`/admin/venues/${venue.id}/reinstate`, {
            preserveScroll: true,
        });

    const isProcessing = approveForm.processing || reinstateForm.processing;

    // Build the contextual menu based on current status.
    const items: Array<{
        key: string;
        label: string;
        icon: typeof Check;
        tone?: 'default' | 'success' | 'warning' | 'destructive';
        onSelect: () => void;
        separator?: 'before';
    }> = [];

    if (venue.status === 'pending') {
        items.push(
            {
                key: 'approve',
                label: 'Approve',
                icon: Check,
                tone: 'success',
                onSelect: approve,
            },
            {
                key: 'reject',
                label: 'Reject…',
                icon: X,
                tone: 'destructive',
                onSelect: () => onAskReason('reject', venue),
                separator: 'before',
            },
        );
    } else if (venue.status === 'approved') {
        items.push({
            key: 'suspend',
            label: 'Suspend…',
            icon: PauseCircle,
            tone: 'warning',
            onSelect: () => onAskReason('suspend', venue),
        });
    } else if (venue.status === 'suspended') {
        items.push(
            {
                key: 'reinstate',
                label: 'Reinstate',
                icon: PlayCircle,
                tone: 'success',
                onSelect: reinstate,
            },
            {
                key: 'reject',
                label: 'Reject…',
                icon: X,
                tone: 'destructive',
                onSelect: () => onAskReason('reject', venue),
                separator: 'before',
            },
        );
    } else if (venue.status === 'rejected') {
        items.push({
            key: 'approve',
            label: 'Approve',
            icon: Check,
            tone: 'success',
            onSelect: approve,
        });
    }

    if (items.length === 0) {
        return <span className="text-[11px] text-[#5c3a21]/60">—</span>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    className="h-8 gap-1.5 rounded-md border border-[#3e2817]/15 bg-white px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] shadow-none hover:bg-[#faf5ec]"
                >
                    {isProcessing ? <Spinner /> : null}
                    Actions
                    <MoreHorizontal className="size-3.5" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {items.map((item) => (
                    <span key={item.key}>
                        {item.separator === 'before' && (
                            <DropdownMenuSeparator />
                        )}
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                item.onSelect();
                            }}
                            className={cn(
                                'gap-2 text-sm',
                                item.tone === 'success' && 'text-[#166534]',
                                item.tone === 'destructive' && 'text-[#991b1b]',
                                item.tone === 'warning' && 'text-[#854d0e]',
                            )}
                        >
                            <item.icon className="size-4" aria-hidden />
                            {item.label}
                        </DropdownMenuItem>
                    </span>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type ReasonDialogProps = {
    state: ReasonDialogState;
    onClose: () => void;
};

function ReasonDialog({ state, onClose }: ReasonDialogProps) {
    const { kind, venue, open } = state;
    const config = kind ? REASON_COPY[kind] : null;

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                {config && venue && (
                    <ReasonForm
                        key={`${kind}-${venue.id}`}
                        config={config}
                        venue={venue}
                        onSuccess={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

type ReasonFormProps = {
    config: (typeof REASON_COPY)[ActionKind];
    venue: Models.Venue;
    onSuccess: () => void;
};

function ReasonForm({ config, venue, onSuccess }: ReasonFormProps) {
    const form = useForm<Record<string, string>>({ [config.field]: '' });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(config.endpoint(venue.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
                <DialogTitle className="font-display text-xl tracking-[-0.01em]">
                    {config.title}
                </DialogTitle>
                <DialogDescription className="font-serif text-sm">
                    {config.description}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 border-l-2 border-[#3e2817]/15 pl-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Venue
                </p>
                <p className="font-display text-sm font-semibold text-[#3e2817]">
                    {venue.name}
                </p>
                <p className="text-xs text-[#5c3a21]">{venue.city}</p>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor={`${config.field}-${venue.id}`}
                    className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]"
                >
                    Reason
                </label>
                <Textarea
                    id={`${config.field}-${venue.id}`}
                    value={form.data[config.field] ?? ''}
                    onChange={(event) =>
                        form.setData(config.field, event.target.value)
                    }
                    rows={4}
                    autoFocus
                    placeholder="Be specific — the owner will see this."
                    className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                />
                <InputError
                    message={form.errors[config.field] as string | undefined}
                    className="text-xs text-red-700"
                />
            </div>

            <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onSuccess}
                    disabled={form.processing}
                    className="text-[#5c3a21] hover:text-[#3e2817]"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={
                        form.processing ||
                        (form.data[config.field] ?? '').trim() === ''
                    }
                    className={cn(
                        'h-9 gap-1.5 rounded-md px-4 text-xs font-medium uppercase tracking-[0.18em] shadow-none disabled:opacity-50',
                        config.ctaClass,
                    )}
                >
                    {form.processing ? <Spinner /> : null}
                    {config.cta}
                </Button>
            </DialogFooter>
        </form>
    );
}

function Th({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <TableHead
            className={cn(
                'h-11 px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]',
                className,
            )}
        >
            {children}
        </TableHead>
    );
}

function Stat({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-md border px-4 py-2',
                highlight
                    ? 'border-[#f37021]/40 bg-[#f37021]/8'
                    : 'border-[#3e2817]/15 bg-white',
            )}
        >
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5c3a21]">
                {label}
            </span>
            <span
                className={cn(
                    'font-display text-xl font-bold leading-tight',
                    highlight ? 'text-[#f37021]' : 'text-[#3e2817]',
                )}
            >
                {value}
            </span>
        </div>
    );
}
