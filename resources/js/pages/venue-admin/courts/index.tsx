import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { cn, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Option = { value: string; label: string };

type Props = {
    venue: Models.Venue;
    courts: Models.Court[];
    surfaceTypes: Option[];
};

const INPUT_CLASS =
    'h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

export default function VenueAdminCourtsIndex({
    venue,
    courts,
    surfaceTypes,
}: Props) {
    const [editing, setEditing] = useState<Models.Court | null>(null);
    const [deleting, setDeleting] = useState<Models.Court | null>(null);
    const surfaceLabel = (value: string | null) =>
        value ? (surfaceTypes.find((s) => s.value === value)?.label ?? value) : '—';

    return (
        <>
            <Head title={`${venue.name} — courts`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <Stats courts={courts} />

                <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
                    <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                            Existing courts
                        </p>
                        <p className="text-[10px] text-[#5c3a21]/65">
                            {courts.length}{' '}
                            {courts.length === 1 ? 'court' : 'courts'}
                        </p>
                    </div>

                    {courts.length === 0 ? (
                        <p className="px-5 py-12 text-center font-serif text-sm text-[#5c3a21]">
                            No courts yet. Add one below.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader className="bg-[#faf5ec]">
                                <TableRow className="border-[#3e2817]/12 hover:bg-[#faf5ec]">
                                    <Th>Name</Th>
                                    <Th>Surface</Th>
                                    <Th>Hourly rate</Th>
                                    <Th>Slot length</Th>
                                    <Th>Status</Th>
                                    <Th className="text-right">Actions</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courts.map((court) => (
                                    <TableRow
                                        key={court.id}
                                        className="border-[#3e2817]/10 transition-colors hover:bg-[#faf5ec]/60"
                                    >
                                        <TableCell className="px-4 py-4">
                                            <p className="font-display text-sm font-semibold text-[#3e2817]">
                                                {court.name}
                                            </p>
                                            {court.description && (
                                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#5c3a21]/80">
                                                    {court.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#3e2817]">
                                            {surfaceLabel(court.surface_type)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 font-display text-sm font-semibold text-[#3e2817]">
                                            {formatPHP(court.hourly_rate)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#5c3a21]">
                                            {court.slot_minutes} min
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <ActiveToggle
                                                venueId={venue.id}
                                                court={court}
                                            />
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditing(court)
                                                    }
                                                    className="h-8 gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#3e2817] hover:bg-[#faf5ec] hover:text-[#f37021]"
                                                >
                                                    <Pencil
                                                        className="size-3.5"
                                                        aria-hidden
                                                    />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeleting(court)
                                                    }
                                                    className="h-8 gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#991b1b] hover:bg-[#fee2e2] hover:text-[#7f1d1d]"
                                                >
                                                    <Trash2
                                                        className="size-3.5"
                                                        aria-hidden
                                                    />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <AddCourtPanel
                    venueId={venue.id}
                    surfaceTypes={surfaceTypes}
                />
            </div>

            {editing && (
                <EditCourtDialog
                    venueId={venue.id}
                    court={editing}
                    surfaceTypes={surfaceTypes}
                    onClose={() => setEditing(null)}
                />
            )}

            {deleting && (
                <DeleteCourtDialog
                    venueId={venue.id}
                    court={deleting}
                    onClose={() => setDeleting(null)}
                />
            )}
        </>
    );
}

function Stats({ courts }: { courts: Models.Court[] }) {
    const active = courts.filter((c) => c.is_active).length;

    return (
        <div className="flex flex-wrap gap-3">
            <Tile label="Total courts" value={courts.length} />
            <Tile label="Active" value={active} accent="success" />
            <Tile
                label="Inactive"
                value={courts.length - active}
                accent={courts.length - active > 0 ? 'muted' : undefined}
            />
        </div>
    );
}

function Tile({
    label,
    value,
    accent,
}: {
    label: string;
    value: number;
    accent?: 'success' | 'muted';
}) {
    return (
        <div className="flex flex-col rounded-md border border-[#3e2817]/15 bg-white px-4 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5c3a21]">
                {label}
            </span>
            <span
                className={cn(
                    'font-display text-xl font-bold leading-tight',
                    accent === 'success' && 'text-[#166534]',
                    accent === 'muted' && 'text-[#5c3a21]/80',
                    !accent && 'text-[#3e2817]',
                )}
            >
                {value}
            </span>
        </div>
    );
}

function ActiveToggle({
    venueId,
    court,
}: {
    venueId: string;
    court: Models.Court;
}) {
    const form = useForm({
        name: court.name,
        surface_type: court.surface_type ?? '',
        description: court.description ?? '',
        hourly_rate: court.hourly_rate,
        slot_minutes: court.slot_minutes,
        is_active: !court.is_active,
    });

    const toggle = () => {
        form.setData('is_active', !court.is_active);
        form.patch(`/venue-admin/venues/${venueId}/courts/${court.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={form.processing}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset transition disabled:opacity-60',
                court.is_active
                    ? 'bg-[#dcfce7] text-[#166534] ring-[#166534]/25 hover:bg-[#bbf7d0]'
                    : 'bg-[#efe6d4] text-[#5c3a21] ring-[#5c3a21]/25 hover:bg-[#e5d6c0]',
            )}
        >
            {form.processing && <Spinner />}
            <span
                className={cn(
                    'size-1.5 rounded-full',
                    court.is_active ? 'bg-[#16a34a]' : 'bg-[#5c3a21]/55',
                )}
            />
            {court.is_active ? 'Active' : 'Inactive'}
        </button>
    );
}

function AddCourtPanel({
    venueId,
    surfaceTypes,
}: {
    venueId: string;
    surfaceTypes: Option[];
}) {
    const form = useForm({
        name: '',
        surface_type: '',
        description: '',
        hourly_rate: '',
        slot_minutes: 60,
        is_active: true,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/venue-admin/venues/${venueId}/courts`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[#3e2817]/15 bg-white p-6"
        >
            <div className="flex items-center gap-2 border-b border-[#3e2817]/12 pb-4">
                <Plus className="size-4 text-[#f37021]" aria-hidden />
                <h2 className="font-display text-base font-bold tracking-[-0.01em] text-[#3e2817]">
                    Add a court
                </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FieldLabel
                    label="Court name"
                    htmlFor="add-name"
                    error={form.errors.name}
                    required
                >
                    <Input
                        id="add-name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="e.g. Court 1, Main Court"
                        className={INPUT_CLASS}
                    />
                </FieldLabel>

                <FieldLabel
                    label="Surface type"
                    htmlFor="add-surface"
                    error={form.errors.surface_type}
                >
                    <Select
                        value={form.data.surface_type}
                        onValueChange={(v) => form.setData('surface_type', v)}
                    >
                        <SelectTrigger id="add-surface" className={INPUT_CLASS}>
                            <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                            {surfaceTypes.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldLabel>

                <FieldLabel
                    label="Hourly rate (₱)"
                    htmlFor="add-rate"
                    error={form.errors.hourly_rate}
                    required
                >
                    <Input
                        id="add-rate"
                        type="number"
                        min="0"
                        step="50"
                        value={form.data.hourly_rate}
                        onChange={(e) =>
                            form.setData('hourly_rate', e.target.value)
                        }
                        placeholder="350"
                        className={INPUT_CLASS}
                    />
                </FieldLabel>

                <FieldLabel
                    label="Slot length"
                    htmlFor="add-slot"
                    error={form.errors.slot_minutes}
                >
                    <Select
                        value={form.data.slot_minutes.toString()}
                        onValueChange={(v) =>
                            form.setData('slot_minutes', parseInt(v, 10))
                        }
                    >
                        <SelectTrigger id="add-slot" className={INPUT_CLASS}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[30, 45, 60, 90, 120].map((m) => (
                                <SelectItem key={m} value={m.toString()}>
                                    {m} min
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldLabel>

                <FieldLabel
                    label="Description (optional)"
                    htmlFor="add-description"
                    error={form.errors.description}
                    className="sm:col-span-2"
                >
                    <Textarea
                        id="add-description"
                        rows={2}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                    />
                </FieldLabel>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#3e2817]/12 pt-4">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
                    <input
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        className="size-4 rounded border-[#3e2817]/25 accent-[#166534]"
                    />
                    Active and bookable
                </label>

                <Button
                    type="submit"
                    disabled={form.processing}
                    className="h-9 gap-2 rounded-md bg-[#3e2817] px-5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-chocolate-deep disabled:opacity-60"
                >
                    {form.processing ? <Spinner /> : <Plus className="size-3.5" />}
                    Add court
                </Button>
            </div>
        </form>
    );
}

function EditCourtDialog({
    venueId,
    court,
    surfaceTypes,
    onClose,
}: {
    venueId: string;
    court: Models.Court;
    surfaceTypes: Option[];
    onClose: () => void;
}) {
    const form = useForm({
        name: court.name,
        surface_type: court.surface_type ?? '',
        description: court.description ?? '',
        hourly_rate: court.hourly_rate.toString(),
        slot_minutes: court.slot_minutes,
        is_active: court.is_active,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/venue-admin/venues/${venueId}/courts/${court.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl tracking-[-0.01em]">
                            Edit court
                        </DialogTitle>
                        <DialogDescription className="font-serif text-sm">
                            Update court details. Members will see the new
                            information immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldLabel
                            label="Court name"
                            htmlFor="edit-name"
                            error={form.errors.name}
                            required
                        >
                            <Input
                                id="edit-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                className={INPUT_CLASS}
                            />
                        </FieldLabel>
                        <FieldLabel
                            label="Surface type"
                            htmlFor="edit-surface"
                            error={form.errors.surface_type}
                        >
                            <Select
                                value={form.data.surface_type}
                                onValueChange={(v) =>
                                    form.setData('surface_type', v)
                                }
                            >
                                <SelectTrigger
                                    id="edit-surface"
                                    className={INPUT_CLASS}
                                >
                                    <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {surfaceTypes.map((s) => (
                                        <SelectItem
                                            key={s.value}
                                            value={s.value}
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldLabel
                            label="Hourly rate (₱)"
                            htmlFor="edit-rate"
                            error={form.errors.hourly_rate}
                            required
                        >
                            <Input
                                id="edit-rate"
                                type="number"
                                min="0"
                                step="50"
                                value={form.data.hourly_rate}
                                onChange={(e) =>
                                    form.setData('hourly_rate', e.target.value)
                                }
                                className={INPUT_CLASS}
                            />
                        </FieldLabel>
                        <FieldLabel
                            label="Slot length"
                            htmlFor="edit-slot"
                            error={form.errors.slot_minutes}
                        >
                            <Select
                                value={form.data.slot_minutes.toString()}
                                onValueChange={(v) =>
                                    form.setData('slot_minutes', parseInt(v, 10))
                                }
                            >
                                <SelectTrigger
                                    id="edit-slot"
                                    className={INPUT_CLASS}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[30, 45, 60, 90, 120].map((m) => (
                                        <SelectItem
                                            key={m}
                                            value={m.toString()}
                                        >
                                            {m} min
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldLabel
                            label="Description"
                            htmlFor="edit-description"
                            error={form.errors.description}
                            className="sm:col-span-2"
                        >
                            <Textarea
                                id="edit-description"
                                rows={2}
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                            />
                        </FieldLabel>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(e) =>
                                form.setData('is_active', e.target.checked)
                            }
                            className="size-4 rounded border-[#3e2817]/25 accent-[#166534]"
                        />
                        Active and bookable
                    </label>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={form.processing}
                            className="text-[#5c3a21] hover:text-[#3e2817]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="h-9 gap-1.5 rounded-md bg-[#3e2817] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-chocolate-deep disabled:opacity-60"
                        >
                            {form.processing && <Spinner />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteCourtDialog({
    venueId,
    court,
    onClose,
}: {
    venueId: string;
    court: Models.Court;
    onClose: () => void;
}) {
    const form = useForm({});

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.delete(`/venue-admin/venues/${venueId}/courts/${court.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle className="font-display text-xl tracking-[-0.01em]">
                            Archive this court?
                        </DialogTitle>
                        <DialogDescription className="font-serif text-sm">
                            <span className="font-semibold text-[#3e2817]">
                                {court.name}
                            </span>{' '}
                            will stop accepting new bookings. Existing bookings
                            stay intact and you can restore the court later
                            via the database.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={form.processing}
                            className="text-[#5c3a21] hover:text-[#3e2817]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="h-9 gap-1.5 rounded-md bg-[#991b1b] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-white shadow-none hover:bg-[#7f1d1d] disabled:opacity-60"
                        >
                            {form.processing ? (
                                <Spinner />
                            ) : (
                                <Trash2 className="size-3.5" aria-hidden />
                            )}
                            Archive court
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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

function FieldLabel({
    label,
    htmlFor,
    error,
    children,
    required,
    className,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('space-y-2', className)}>
            <label
                htmlFor={htmlFor}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]"
            >
                {label}
                {required && <span className="text-[#f37021]">*</span>}
            </label>
            {children}
            <InputError message={error} className="text-xs text-red-700" />
        </div>
    );
}
