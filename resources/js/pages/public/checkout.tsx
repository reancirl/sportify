import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Copy,
    CreditCard,
    Lock,
    Smartphone,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatInManila, formatPHP } from '@/lib/utils';

type Venue = {
    id: string;
    name: string;
    slug: string;
    city: string;
    province: string;
    timezone: string;
    gcash_account_name: string | null;
    gcash_mobile_number: string | null;
    contact_email: string | null;
    contact_phone: string | null;
};

type Court = {
    id: string;
    name: string;
    surface_type: string | null;
    hourly_rate: string;
    slot_minutes: number;
};

type Reservation = {
    starts_at: string;
    ends_at: string;
    slot_count: number;
    hours: number;
    total_amount: number;
};

type Props = {
    venue: Venue;
    court: Court;
    reservation: Reservation;
};

type CheckoutForm = {
    court_id: string;
    starts_at: string;
    slot_count: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    reference_number: string;
    payment_proof: File | null;
    notes: string;
};

const INPUT_CLASS =
    'h-11 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

export default function PublicCheckout({ venue, court, reservation }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const form = useForm<CheckoutForm>({
        court_id: court.id,
        starts_at: reservation.starts_at,
        slot_count: reservation.slot_count,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        reference_number: '',
        payment_proof: null,
        notes: '',
    });

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('payment_proof', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        form.setData('payment_proof', null);
        setFilePreview(null);

        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/checkout', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const copyToClipboard = (value: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value);
        }
    };

    const hasGcash =
        venue.gcash_account_name && venue.gcash_mobile_number;

    return (
        <>
            <Head title={`Checkout — ${venue.name}`} />

            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                <Link
                    href={`/venues/${venue.slug}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21] transition hover:text-[#f37021]"
                >
                    <ArrowLeft className="size-3.5" aria-hidden />
                    Back to {venue.name}
                </Link>

                <header className="space-y-2 border-b border-[#3e2817]/12 pb-6">
                    <p className="editorial-label">Checkout</p>
                    <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#3e2817]">
                        Confirm &amp; pay
                    </h1>
                    <p className="font-serif text-sm text-[#5c3a21]">
                        Send payment via GCash, then upload the screenshot. The
                        venue will verify and confirm your booking.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
                >
                    <div className="space-y-6">
                        {/* Contact info */}
                        <SectionCard
                            eyebrow="Step 1"
                            title="Your details"
                            description="We'll send your booking confirmation here."
                        >
                            <div className="grid gap-4">
                                <Field
                                    label="Full name"
                                    htmlFor="guest_name"
                                    error={form.errors.guest_name}
                                    required
                                >
                                    <Input
                                        id="guest_name"
                                        value={form.data.guest_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'guest_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Maria Santos"
                                        className={INPUT_CLASS}
                                    />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Email"
                                        htmlFor="guest_email"
                                        error={form.errors.guest_email}
                                        required
                                    >
                                        <Input
                                            id="guest_email"
                                            type="email"
                                            value={form.data.guest_email}
                                            onChange={(e) =>
                                                form.setData(
                                                    'guest_email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="you@example.com"
                                            className={INPUT_CLASS}
                                        />
                                    </Field>
                                    <Field
                                        label="Mobile"
                                        htmlFor="guest_phone"
                                        error={form.errors.guest_phone}
                                        required
                                    >
                                        <Input
                                            id="guest_phone"
                                            type="tel"
                                            value={form.data.guest_phone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'guest_phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="09171234567"
                                            className={INPUT_CLASS}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Payment instructions */}
                        <SectionCard
                            eyebrow="Step 2"
                            title="Send payment via GCash"
                            description={`Send ${formatPHP(reservation.total_amount)} to the account below. You'll upload the screenshot in step 3.`}
                        >
                            {hasGcash ? (
                                <div className="rounded-md border border-[#3e2817]/15 bg-[#faf5ec]/60 p-5">
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <span className="flex size-9 items-center justify-center rounded-md bg-[#0080ff] text-white">
                                            <Smartphone className="size-4" aria-hidden />
                                        </span>
                                        <div>
                                            <p className="font-display text-base font-bold text-[#3e2817]">
                                                GCash
                                            </p>
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]">
                                                Manual verification
                                            </p>
                                        </div>
                                    </div>

                                    <CopyRow
                                        label="Account name"
                                        value={venue.gcash_account_name!}
                                        onCopy={copyToClipboard}
                                    />
                                    <CopyRow
                                        label="Mobile number"
                                        value={venue.gcash_mobile_number!}
                                        onCopy={copyToClipboard}
                                    />
                                    <p className="mt-4 border-t border-[#3e2817]/10 pt-3 font-serif text-sm text-[#5c3a21]">
                                        Send{' '}
                                        <span className="font-display font-bold text-[#3e2817]">
                                            {formatPHP(reservation.total_amount)}
                                        </span>{' '}
                                        to this account.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-md border border-dashed border-[#3e2817]/25 bg-[#faf5ec] p-5">
                                    <p className="font-serif text-sm text-[#5c3a21]">
                                        This venue hasn't published a GCash
                                        account yet. Please contact{' '}
                                        {venue.contact_email ??
                                            venue.contact_phone ??
                                            'the venue'}{' '}
                                        to arrange payment, then upload your
                                        proof below.
                                    </p>
                                </div>
                            )}

                            <Field
                                label="Reference number (optional)"
                                htmlFor="reference_number"
                                error={form.errors.reference_number}
                                hint="Last digits of the GCash transaction reference, if available."
                            >
                                <Input
                                    id="reference_number"
                                    value={form.data.reference_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'reference_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0000123456"
                                    className={INPUT_CLASS}
                                />
                            </Field>
                        </SectionCard>

                        {/* Payment proof upload */}
                        <SectionCard
                            eyebrow="Step 3"
                            title="Upload payment screenshot"
                            description="PNG or JPG, up to 5 MB. Make sure the amount and reference are visible."
                        >
                            <input
                                ref={fileRef}
                                id="payment_proof"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFile}
                                className="sr-only"
                            />

                            {filePreview ? (
                                <div className="relative overflow-hidden rounded-md border border-[#3e2817]/15">
                                    <img
                                        src={filePreview}
                                        alt="Payment proof preview"
                                        className="max-h-72 w-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#3e2817]/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#faf5ec] backdrop-blur transition hover:bg-[#3e2817]"
                                    >
                                        Replace
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-[#3e2817]/30 bg-[#faf5ec]/50 px-6 py-10 text-center transition hover:border-[#f37021] hover:bg-[#f37021]/5"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full bg-[#3e2817]/8 text-[#3e2817]">
                                        <Upload className="size-4" aria-hidden />
                                    </span>
                                    <p className="font-display text-base font-bold text-[#3e2817]">
                                        Click to upload screenshot
                                    </p>
                                    <p className="font-serif text-xs text-[#5c3a21]">
                                        Or drop your image here · PNG, JPG up to 5 MB
                                    </p>
                                </button>
                            )}

                            <InputError
                                message={form.errors.payment_proof}
                                className="mt-2 text-xs text-red-700"
                            />
                        </SectionCard>

                        <SectionCard
                            eyebrow="Notes (optional)"
                            title="Anything the venue should know?"
                            description="Special requests, equipment rental, etc."
                        >
                            <Textarea
                                rows={3}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                                placeholder="e.g. Please prep extra chairs for spectators."
                                className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                            />
                        </SectionCard>
                    </div>

                    {/* Order summary */}
                    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                        <div className="overflow-hidden rounded-md border border-[#3e2817]/15 bg-white">
                            <div className="border-b border-[#3e2817]/12 px-6 py-4">
                                <p className="editorial-label">Order summary</p>
                            </div>
                            <div className="space-y-4 px-6 py-5">
                                <div className="space-y-1">
                                    <p className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                                        {venue.name}
                                    </p>
                                    <p className="text-[11px] text-[#5c3a21]">
                                        {venue.city}, {venue.province}
                                    </p>
                                </div>

                                <dl className="space-y-2.5 border-t border-[#3e2817]/10 pt-4 font-serif text-sm">
                                    <Row
                                        label="Court"
                                        value={court.name}
                                    />
                                    <Row
                                        label="Date"
                                        value={formatInManila(
                                            reservation.starts_at,
                                            'PP',
                                        )}
                                    />
                                    <Row
                                        label="Time"
                                        value={`${formatInManila(reservation.starts_at, 'p')} – ${formatInManila(reservation.ends_at, 'p')}`}
                                    />
                                    <Row
                                        label="Duration"
                                        value={`${reservation.hours} ${reservation.hours === 1 ? 'hour' : 'hours'} (${reservation.slot_count} ${reservation.slot_count === 1 ? 'slot' : 'slots'})`}
                                    />
                                    <Row
                                        label="Hourly rate"
                                        value={formatPHP(court.hourly_rate)}
                                    />
                                </dl>

                                <div className="flex items-baseline justify-between border-t border-[#3e2817]/10 pt-4">
                                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                                        Total
                                    </span>
                                    <span className="font-display text-2xl font-bold tracking-[-0.02em] text-[#3e2817]">
                                        {formatPHP(reservation.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-[#3e2817]/12 bg-[#faf5ec]/60 px-6 py-5">
                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !form.data.payment_proof
                                    }
                                    className={cn(
                                        'group h-12 w-full gap-2 rounded-md text-xs font-medium uppercase tracking-[0.22em] shadow-none disabled:opacity-60',
                                        form.data.payment_proof
                                            ? 'bg-[#3e2817] text-[#faf5ec] hover:bg-[#2a1a0e]'
                                            : 'bg-[#3e2817]/40 text-[#faf5ec]',
                                    )}
                                >
                                    {form.processing ? (
                                        <Spinner />
                                    ) : (
                                        <CheckCircle2 className="size-4" />
                                    )}
                                    {form.data.payment_proof
                                        ? 'Submit booking'
                                        : 'Upload proof to continue'}
                                    {form.data.payment_proof && (
                                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                    )}
                                </Button>

                                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/70">
                                    <Lock className="size-3" aria-hidden />
                                    No login required · Manual GCash
                                </p>
                            </div>
                        </div>

                        <div className="rounded-md border border-[#3e2817]/15 bg-white px-5 py-4">
                            <div className="mb-2 flex items-center gap-2">
                                <CreditCard
                                    className="size-3.5 text-[#5c3a21]"
                                    aria-hidden
                                />
                                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                                    What happens next?
                                </p>
                            </div>
                            <ol className="ml-4 list-decimal space-y-1.5 font-serif text-xs text-[#5c3a21]">
                                <li>Send payment via GCash.</li>
                                <li>Upload the screenshot &amp; submit.</li>
                                <li>
                                    The venue verifies your payment (usually
                                    within a few hours).
                                </li>
                                <li>
                                    You'll receive a confirmation email with
                                    your booking details.
                                </li>
                            </ol>
                        </div>
                    </aside>
                </form>
            </div>
        </>
    );
}

/* ── Bits ────────────────────────────────────────────────────────────── */

function SectionCard({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-md border border-[#3e2817]/15 bg-white">
            <div className="border-b border-[#3e2817]/12 px-6 py-4">
                <p className="editorial-label">{eyebrow}</p>
                <h2 className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                    {title}
                </h2>
                <p className="mt-1 font-serif text-sm text-[#5c3a21]">
                    {description}
                </p>
            </div>
            <div className="space-y-5 px-6 py-5">{children}</div>
        </section>
    );
}

function Field({
    label,
    htmlFor,
    error,
    children,
    required,
    hint,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={htmlFor}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]"
            >
                {label}
                {required && <span className="text-[#f37021]">*</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="text-xs text-[#5c3a21]/75">{hint}</p>
            )}
            <InputError message={error} className="text-xs text-red-700" />
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[#5c3a21]">{label}</dt>
            <dd className="text-right font-medium text-[#3e2817]">{value}</dd>
        </div>
    );
}

function CopyRow({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy: (value: string) => void;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex items-center justify-between gap-3 border-t border-[#3e2817]/10 py-3 first:border-t-0">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                {label}
            </span>
            <button
                type="button"
                onClick={handleCopy}
                className="group inline-flex items-center gap-2 font-display text-base font-bold tracking-[-0.01em] text-[#3e2817] transition hover:text-[#f37021]"
            >
                <span>{value}</span>
                {copied ? (
                    <CheckCircle2 className="size-3.5 text-[#166534]" aria-hidden />
                ) : (
                    <Copy
                        className="size-3.5 text-[#5c3a21]/55 transition group-hover:text-[#f37021]"
                        aria-hidden
                    />
                )}
            </button>
        </div>
    );
}
