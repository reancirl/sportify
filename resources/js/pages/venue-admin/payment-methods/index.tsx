import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { cn } from '@/lib/utils';
import type { Models } from '@/types';

type Provider = {
    value: Models.PaymentProvider;
    label: string;
};

type Props = {
    venue: Models.Venue;
    paymentMethods: { data: Models.VenuePaymentMethod[] };
    providers: Provider[];
};

const INPUT_CLASS =
    'h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

export default function VenueAdminPaymentMethodsIndex({
    venue,
    paymentMethods,
    providers,
}: Props) {
    const methods = paymentMethods.data;

    // Providers that haven't been configured yet
    const usedProviders = methods.map((m) => m.provider);
    const availableProviders = providers.filter(
        (p) => !usedProviders.includes(p.value),
    );

    return (
        <>
            <Head title={`${venue.name} — payment setup`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <div className="space-y-2">
                    <p className="editorial-label">Payment setup</p>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-[#3e2817]">
                        Payment methods
                    </h2>
                    <p className="max-w-xl font-serif text-sm text-[#5c3a21]">
                        Add the GCash, Maya, or other digital-wallet accounts
                        where guests should send payment. Inactive methods stay
                        hidden from the public checkout.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    {/* Left — existing methods */}
                    <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
                        <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-4">
                            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                                Configured methods
                            </p>
                            <p className="text-[10px] text-[#5c3a21]/65">
                                {methods.length}{' '}
                                {methods.length === 1 ? 'method' : 'methods'}
                            </p>
                        </div>

                        {methods.length === 0 ? (
                            <p className="px-5 py-12 text-center font-serif text-sm text-[#5c3a21]">
                                No payment methods yet. Add one on the right.
                            </p>
                        ) : (
                            <ul className="divide-y divide-[#3e2817]/10">
                                {methods.map((method) => (
                                    <MethodCard
                                        key={method.id}
                                        venueId={venue.id}
                                        method={method}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Right — add form */}
                    <AddMethodPanel
                        venueId={venue.id}
                        availableProviders={availableProviders}
                    />
                </div>
            </div>
        </>
    );
}

/* ── Method card ─────────────────────────────────────────────────────── */

function MethodCard({
    venueId,
    method,
}: {
    venueId: string;
    method: Models.VenuePaymentMethod;
}) {
    const [isEditing, setIsEditing] = useState(false);

    const toggleForm = useForm({
        account_name: method.account_name,
        mobile_number: method.mobile_number,
        is_active: !method.is_active,
        sort_order: method.sort_order,
    });

    const handleToggle = () => {
        toggleForm.setData('is_active', !method.is_active);
        toggleForm.patch(
            `/venue-admin/venues/${venueId}/payment-methods/${method.id}`,
            { preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (
            !window.confirm(
                `Remove ${method.provider_label} (${method.account_name})? This cannot be undone.`,
            )
        ) {
            return;
        }
        router.delete(
            `/venue-admin/venues/${venueId}/payment-methods/${method.id}`,
            { preserveScroll: true },
        );
    };

    return (
        <li className="px-5 py-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#faf5ec] text-[#3e2817]">
                        <Wallet className="size-4" aria-hidden />
                    </span>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                            {method.provider_label}
                        </p>
                        <p className="font-display text-base font-bold leading-tight text-[#3e2817]">
                            {method.account_name}
                        </p>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            {method.mobile_number}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={toggleForm.processing}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset transition disabled:opacity-60',
                            method.is_active
                                ? 'bg-[#dcfce7] text-[#166534] ring-[#166534]/25 hover:bg-[#bbf7d0]'
                                : 'bg-[#efe6d4] text-[#5c3a21] ring-[#5c3a21]/25 hover:bg-[#e5d6c0]',
                        )}
                    >
                        {toggleForm.processing && <Spinner />}
                        <span
                            className={cn(
                                'size-1.5 rounded-full',
                                method.is_active
                                    ? 'bg-[#16a34a]'
                                    : 'bg-[#5c3a21]/55',
                            )}
                        />
                        {method.is_active ? 'Active' : 'Inactive'}
                    </button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing((v) => !v)}
                        className="h-7 gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#3e2817] hover:bg-[#faf5ec] hover:text-[#f37021]"
                        aria-label={isEditing ? 'Cancel edit' : 'Edit method'}
                    >
                        {isEditing ? (
                            <X className="size-3.5" aria-hidden />
                        ) : (
                            <Pencil className="size-3.5" aria-hidden />
                        )}
                        {isEditing ? 'Cancel' : 'Edit'}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-7 gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#991b1b] hover:bg-[#fee2e2] hover:text-[#7f1d1d]"
                        aria-label={`Delete ${method.provider_label}`}
                    >
                        <Trash2 className="size-3.5" aria-hidden />
                        Delete
                    </Button>
                </div>
            </div>

            {isEditing && (
                <EditMethodInline
                    venueId={venueId}
                    method={method}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </li>
    );
}

/* ── Inline edit form ────────────────────────────────────────────────── */

function EditMethodInline({
    venueId,
    method,
    onClose,
}: {
    venueId: string;
    method: Models.VenuePaymentMethod;
    onClose: () => void;
}) {
    const form = useForm({
        account_name: method.account_name,
        mobile_number: method.mobile_number,
        is_active: method.is_active,
        sort_order: method.sort_order,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(
            `/venue-admin/venues/${venueId}/payment-methods/${method.id}`,
            {
                preserveScroll: true,
                onSuccess: onClose,
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-4 rounded-md border border-[#3e2817]/12 bg-[#faf5ec]/60 p-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel
                    label="Account name"
                    htmlFor={`edit-name-${method.id}`}
                    error={form.errors.account_name}
                    required
                >
                    <Input
                        id={`edit-name-${method.id}`}
                        value={form.data.account_name}
                        onChange={(e) =>
                            form.setData('account_name', e.target.value)
                        }
                        maxLength={120}
                        className={INPUT_CLASS}
                    />
                </FieldLabel>

                <FieldLabel
                    label="Mobile number"
                    htmlFor={`edit-mobile-${method.id}`}
                    error={form.errors.mobile_number}
                    required
                >
                    <Input
                        id={`edit-mobile-${method.id}`}
                        value={form.data.mobile_number}
                        onChange={(e) =>
                            form.setData('mobile_number', e.target.value)
                        }
                        placeholder="09171234567"
                        maxLength={20}
                        className={INPUT_CLASS}
                    />
                </FieldLabel>
            </div>

            <div className="flex items-center justify-between border-t border-[#3e2817]/12 pt-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
                    <input
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        className="size-4 rounded border-[#3e2817]/25 accent-[#166534]"
                    />
                    Active
                </label>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={form.processing}
                        className="h-8 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21] hover:text-[#3e2817]"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={form.processing}
                        className="h-8 gap-1.5 rounded-md bg-[#3e2817] px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#2a1a0e] disabled:opacity-60"
                    >
                        {form.processing && <Spinner />}
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
}

/* ── Add method panel ────────────────────────────────────────────────── */

function AddMethodPanel({
    venueId,
    availableProviders,
}: {
    venueId: string;
    availableProviders: Provider[];
}) {
    const allConfigured = availableProviders.length === 0;

    const form = useForm({
        provider: availableProviders[0]?.value ?? '',
        account_name: '',
        mobile_number: '',
        is_active: true,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/venue-admin/venues/${venueId}/payment-methods`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
            <div className="flex items-center gap-2 border-b border-[#3e2817]/12 px-5 py-4">
                <Plus className="size-4 text-[#f37021]" aria-hidden />
                <h2 className="font-display text-base font-bold tracking-[-0.01em] text-[#3e2817]">
                    Add payment method
                </h2>
            </div>

            {allConfigured ? (
                <div className="px-5 py-10 text-center">
                    <p className="font-serif text-sm text-[#5c3a21]">
                        All available payment providers have been configured for
                        this venue.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    <FieldLabel
                        label="Provider"
                        htmlFor="add-provider"
                        error={form.errors.provider}
                        required
                    >
                        <Select
                            value={form.data.provider}
                            onValueChange={(v) => form.setData('provider', v as Models.PaymentProvider)}
                        >
                            <SelectTrigger id="add-provider" className={INPUT_CLASS}>
                                <SelectValue placeholder="Select provider…" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProviders.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FieldLabel>

                    <FieldLabel
                        label="Account name"
                        htmlFor="add-account-name"
                        error={form.errors.account_name}
                        required
                    >
                        <Input
                            id="add-account-name"
                            value={form.data.account_name}
                            onChange={(e) =>
                                form.setData('account_name', e.target.value)
                            }
                            placeholder="e.g. Maria Santos"
                            maxLength={120}
                            className={INPUT_CLASS}
                        />
                    </FieldLabel>

                    <FieldLabel
                        label="Mobile number"
                        htmlFor="add-mobile-number"
                        error={form.errors.mobile_number}
                        required
                    >
                        <Input
                            id="add-mobile-number"
                            value={form.data.mobile_number}
                            onChange={(e) =>
                                form.setData('mobile_number', e.target.value)
                            }
                            placeholder="09171234567"
                            maxLength={20}
                            className={INPUT_CLASS}
                        />
                    </FieldLabel>

                    <div className="flex items-center justify-between border-t border-[#3e2817]/12 pt-4">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.checked)
                                }
                                className="size-4 rounded border-[#3e2817]/25 accent-[#166534]"
                            />
                            Active immediately
                        </label>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="h-9 gap-2 rounded-md bg-[#3e2817] px-5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#2a1a0e] disabled:opacity-60"
                        >
                            {form.processing ? (
                                <Spinner />
                            ) : (
                                <Plus className="size-3.5" />
                            )}
                            Add method
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

/* ── Shared field label ──────────────────────────────────────────────── */

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
