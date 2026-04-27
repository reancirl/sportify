import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Contact,
    LayoutGrid,
    MapPin,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Option = { value: string; label: string };

type CourtRow = {
    name: string;
    surface_type: string;
    hourly_rate: string;
    slot_minutes: string;
    is_active: boolean;
};

type WizardData = {
    name: string;
    description: string;
    amenities: string[];
    advance_booking_weeks: string;

    address_line: string;
    barangay: string;
    city: string;
    province: string;
    region: string;
    postal_code: string;
    google_maps_url: string;
    latitude: string;
    longitude: string;

    contact_phone: string;
    contact_email: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    tiktok_url: string;
    website_url: string;

    courts: CourtRow[];
};

type Props = {
    amenities: Option[];
    surfaceTypes: Option[];
};

const STEPS = [
    { key: 'basic', label: 'Basic Info', caption: 'Venue name and details', icon: Sparkles },
    { key: 'location', label: 'Location', caption: 'Address and area', icon: MapPin },
    { key: 'contact', label: 'Contact', caption: 'Contact information', icon: Contact },
    { key: 'courts', label: 'Courts & Pricing', caption: 'Set up your courts', icon: LayoutGrid },
    { key: 'review', label: 'Review', caption: 'Confirm & submit', icon: Check },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export default function VenueAdminVenuesCreate({
    amenities,
    surfaceTypes,
}: Props) {
    const { sportify } = usePage().props;
    const { region } = sportify;

    const form = useForm<WizardData>({
        name: '',
        description: '',
        amenities: [],
        advance_booking_weeks: '4',

        address_line: '',
        barangay: '',
        city: region.city,
        province: 'Lanao del Norte',
        region: 'Northern Mindanao',
        postal_code: '',
        google_maps_url: '',
        latitude: '',
        longitude: '',

        contact_phone: '',
        contact_email: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        tiktok_url: '',
        website_url: '',

        courts: [emptyCourt()],
    });

    const [stepIndex, setStepIndex] = useState(0);
    const currentStep: StepKey = STEPS[stepIndex].key;

    const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        // Convert numeric strings to numbers/null where needed before posting.
        // Inertia will pass strings as-is; the backend casts them.
        form.transform((data) => ({
            ...data,
            advance_booking_weeks: data.advance_booking_weeks
                ? parseInt(data.advance_booking_weeks, 10)
                : 4,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            courts: data.courts.map((c) => ({
                name: c.name,
                surface_type: c.surface_type || null,
                hourly_rate: c.hourly_rate ? parseFloat(c.hourly_rate) : 0,
                slot_minutes: c.slot_minutes
                    ? parseInt(c.slot_minutes, 10)
                    : 60,
                is_active: c.is_active,
            })),
        }));

        form.post('/venue-admin/venues', { preserveScroll: true });
    };

    const goNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex((i) => i + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goPrev = () => {
        if (stepIndex > 0) {
            setStepIndex((i) => i - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head title="Create venue" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-6">
                <Header />

                <Stepper currentIndex={stepIndex} />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 border border-[#3e2817]/15 bg-white p-8"
                >
                    {currentStep === 'basic' && (
                        <BasicInfoStep
                            data={form.data}
                            errors={form.errors as Record<string, string>}
                            onChange={form.setData}
                            amenityOptions={amenities}
                        />
                    )}
                    {currentStep === 'location' && (
                        <LocationStep
                            data={form.data}
                            errors={form.errors as Record<string, string>}
                            onChange={form.setData}
                        />
                    )}
                    {currentStep === 'contact' && (
                        <ContactStep
                            data={form.data}
                            errors={form.errors as Record<string, string>}
                            onChange={form.setData}
                        />
                    )}
                    {currentStep === 'courts' && (
                        <CourtsStep
                            courts={form.data.courts}
                            errors={form.errors as Record<string, string>}
                            onChange={(courts) => form.setData('courts', courts)}
                            surfaceTypes={surfaceTypes}
                        />
                    )}
                    {currentStep === 'review' && (
                        <ReviewStep
                            data={form.data}
                            amenityOptions={amenities}
                            surfaceTypes={surfaceTypes}
                            onJumpTo={(key) =>
                                setStepIndex(
                                    STEPS.findIndex((s) => s.key === key),
                                )
                            }
                        />
                    )}

                    <Footer
                        stepIndex={stepIndex}
                        processing={form.processing}
                        onPrev={goPrev}
                        onNext={goNext}
                        onSubmit={handleSubmit}
                    />
                </form>
            </div>
        </>
    );
}

/* ── Header & stepper ────────────────────────────────────────────────── */

function Header() {
    return (
        <header className="flex flex-col gap-2 border-b border-[#3e2817]/12 pb-6">
            <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                <Building2 className="size-3.5 text-[#f37021]" />
                Venue setup
            </p>
            <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                Create a venue
            </h1>
            <p className="font-serif text-sm text-[#5c3a21]">
                Tell us about your venue, where it is, how to reach you, and
                the courts you offer. We'll review and approve before it goes
                live.
            </p>
        </header>
    );
}

function Stepper({ currentIndex }: { currentIndex: number }) {
    return (
        <ol className="grid gap-3 sm:grid-cols-5">
            {STEPS.map((step, idx) => {
                const isActive = idx === currentIndex;
                const isComplete = idx < currentIndex;

                return (
                    <li
                        key={step.key}
                        className="flex flex-col items-start gap-2"
                    >
                        <div
                            className={cn(
                                'flex size-9 items-center justify-center rounded-full border text-xs font-semibold transition',
                                isComplete &&
                                    'border-transparent bg-[#166534] text-white',
                                isActive &&
                                    'border-[#3e2817] bg-[#3e2817] text-[#faf5ec]',
                                !isActive &&
                                    !isComplete &&
                                    'border-[#3e2817]/25 bg-white text-[#5c3a21]',
                            )}
                        >
                            {isComplete ? (
                                <Check className="size-4" aria-hidden />
                            ) : (
                                idx + 1
                            )}
                        </div>
                        <div>
                            <p
                                className={cn(
                                    'text-[11px] font-medium uppercase tracking-[0.18em]',
                                    isActive
                                        ? 'text-[#3e2817]'
                                        : 'text-[#5c3a21]',
                                )}
                            >
                                {step.label}
                            </p>
                            <p className="text-[10px] text-[#5c3a21]/75">
                                {step.caption}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

/* ── Step: Basic Info ───────────────────────────────────────────────── */

type StepProps = {
    data: WizardData;
    errors: Record<string, string>;
    onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
};

function BasicInfoStep({
    data,
    errors,
    onChange,
    amenityOptions,
}: StepProps & { amenityOptions: Option[] }) {
    const { sportify } = usePage().props;
    const { region } = sportify;
    const venuePlaceholder = region.sample_areas[0]
        ? `${region.sample_areas[0]} Sports Club`
        : 'Court Club';

    const toggleAmenity = (value: string) => {
        const next = data.amenities.includes(value)
            ? data.amenities.filter((a) => a !== value)
            : [...data.amenities, value];
        onChange('amenities', next);
    };

    return (
        <div className="space-y-8">
            <SectionTitle
                title="Basic info"
                subtitle="Venue name and details"
            />

            <Field label="Venue name" htmlFor="name" error={errors.name} required>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder={`e.g. ${venuePlaceholder}`}
                    className={INPUT_CLASS}
                />
            </Field>

            <Field
                label="Description (optional)"
                htmlFor="description"
                error={errors.description}
                hint="A short paragraph members will read before booking."
            >
                <Textarea
                    id="description"
                    rows={4}
                    value={data.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Tournament-grade indoor courts, full pro shop, members lounge…"
                    className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                />
            </Field>

            <Field
                label="Advance booking window"
                htmlFor="advance"
                error={errors.advance_booking_weeks}
                hint="How far in advance members can book (1 – 52 weeks)."
            >
                <Select
                    value={data.advance_booking_weeks}
                    onValueChange={(v) => onChange('advance_booking_weeks', v)}
                >
                    <SelectTrigger
                        id="advance"
                        className="h-10 w-44 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4, 6, 8, 12, 16, 26, 52].map((w) => (
                            <SelectItem key={w} value={w.toString()}>
                                {w} {w === 1 ? 'week' : 'weeks'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    Amenities
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {amenityOptions.map((amenity) => {
                        const checked = data.amenities.includes(amenity.value);

                        return (
                            <label
                                key={amenity.value}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition',
                                    checked
                                        ? 'border-[#f37021] bg-[#f37021]/5'
                                        : 'border-[#3e2817]/15 bg-white hover:border-[#3e2817]/30',
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        toggleAmenity(amenity.value)
                                    }
                                    className="size-4 rounded border-[#3e2817]/25 accent-[#f37021]"
                                />
                                <span className="font-serif text-[#3e2817]">
                                    {amenity.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
                <InputError
                    message={errors.amenities}
                    className="mt-2 text-xs text-red-700"
                />
            </div>
        </div>
    );
}

/* ── Step: Location ─────────────────────────────────────────────────── */

function LocationStep({ data, errors, onChange }: StepProps) {
    const { sportify } = usePage().props;
    const sampleAreaPlaceholder = sportify.region.sample_areas[0]
        ? `e.g. ${sportify.region.sample_areas[0]}`
        : 'e.g. Barangay';

    return (
        <div className="space-y-8">
            <SectionTitle title="Location" subtitle="Address and area" />

            <Field
                label="Street address"
                htmlFor="address_line"
                error={errors.address_line}
                required
                hint="Full street address including building number and street name."
            >
                <Input
                    id="address_line"
                    value={data.address_line}
                    onChange={(e) => onChange('address_line', e.target.value)}
                    className={INPUT_CLASS}
                />
            </Field>

            <Field
                label="Barangay (optional)"
                htmlFor="barangay"
                error={errors.barangay}
                hint="Barangay where your venue is located."
            >
                <Input
                    id="barangay"
                    value={data.barangay}
                    onChange={(e) => onChange('barangay', e.target.value)}
                    placeholder={sampleAreaPlaceholder}
                    className={INPUT_CLASS}
                />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
                <Field
                    label="City"
                    htmlFor="city"
                    error={errors.city}
                    required
                >
                    <Input
                        id="city"
                        value={data.city}
                        onChange={(e) => onChange('city', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>
                <Field
                    label="Province"
                    htmlFor="province"
                    error={errors.province}
                    required
                >
                    <Input
                        id="province"
                        value={data.province}
                        onChange={(e) => onChange('province', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Field
                    label="Region"
                    htmlFor="region"
                    error={errors.region}
                    required
                >
                    <Input
                        id="region"
                        value={data.region}
                        onChange={(e) => onChange('region', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>
                <Field
                    label="Postal code (optional)"
                    htmlFor="postal_code"
                    error={errors.postal_code}
                >
                    <Input
                        id="postal_code"
                        value={data.postal_code}
                        onChange={(e) =>
                            onChange('postal_code', e.target.value)
                        }
                        placeholder="9200"
                        className={INPUT_CLASS}
                    />
                </Field>
            </div>

            <Field
                label="Google Maps link (optional)"
                htmlFor="google_maps_url"
                error={errors.google_maps_url}
                hint="Paste your venue's Google Maps link to show a map on your venue page."
            >
                <Input
                    id="google_maps_url"
                    value={data.google_maps_url}
                    onChange={(e) =>
                        onChange('google_maps_url', e.target.value)
                    }
                    placeholder="https://maps.google.com/…"
                    className={INPUT_CLASS}
                />
            </Field>
        </div>
    );
}

/* ── Step: Contact ──────────────────────────────────────────────────── */

function ContactStep({ data, errors, onChange }: StepProps) {
    return (
        <div className="space-y-8">
            <SectionTitle
                title="Contact"
                subtitle="Provide at least one contact method (email or phone). Social media links are optional."
            />

            <div className="grid gap-6 sm:grid-cols-2">
                <Field
                    label="Email address"
                    htmlFor="contact_email"
                    error={errors.contact_email}
                >
                    <Input
                        id="contact_email"
                        type="email"
                        value={data.contact_email}
                        onChange={(e) =>
                            onChange('contact_email', e.target.value)
                        }
                        placeholder="hello@yourvenue.com"
                        className={INPUT_CLASS}
                    />
                </Field>
                <Field
                    label="Phone number"
                    htmlFor="contact_phone"
                    error={errors.contact_phone}
                    hint="Philippine mobile number (e.g. 09171234567)."
                >
                    <Input
                        id="contact_phone"
                        type="tel"
                        value={data.contact_phone}
                        onChange={(e) =>
                            onChange('contact_phone', e.target.value)
                        }
                        placeholder="+63 917 555 0011"
                        className={INPUT_CLASS}
                    />
                </Field>
            </div>

            <div className="space-y-2 border-t border-[#3e2817]/12 pt-6">
                <p className="font-display text-base font-semibold text-[#3e2817]">
                    Social media (optional)
                </p>
                <p className="font-serif text-sm text-[#5c3a21]">
                    Add your profiles so members can find you.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {(
                    [
                        ['facebook_url', 'Facebook'],
                        ['instagram_url', 'Instagram'],
                        ['twitter_url', 'Twitter / X'],
                        ['tiktok_url', 'TikTok'],
                        ['website_url', 'Website'],
                    ] as const
                ).map(([key, label]) => (
                    <Field
                        key={key}
                        label={label}
                        htmlFor={key}
                        error={errors[key]}
                    >
                        <Input
                            id={key}
                            value={data[key]}
                            onChange={(e) => onChange(key, e.target.value)}
                            placeholder="https://…"
                            className={INPUT_CLASS}
                        />
                    </Field>
                ))}
            </div>
        </div>
    );
}

/* ── Step: Courts & Pricing ─────────────────────────────────────────── */

function CourtsStep({
    courts,
    errors,
    onChange,
    surfaceTypes,
}: {
    courts: CourtRow[];
    errors: Record<string, string>;
    onChange: (courts: CourtRow[]) => void;
    surfaceTypes: Option[];
}) {
    const updateCourt = (idx: number, patch: Partial<CourtRow>) => {
        onChange(
            courts.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
        );
    };

    const addCourt = () => onChange([...courts, emptyCourt(courts.length + 1)]);

    const removeCourt = (idx: number) => {
        if (courts.length === 1) {
            return;
        }

        onChange(courts.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-8">
            <SectionTitle
                title="Courts & pricing"
                subtitle="Set up the courts at your venue. You can add up to 20."
            />

            <ul className="space-y-5">
                {courts.map((court, idx) => (
                    <li
                        key={idx}
                        className="space-y-5 rounded-md border border-[#3e2817]/15 bg-[#faf5ec]/40 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-display text-base font-semibold text-[#3e2817]">
                                Court {idx + 1}
                            </p>
                            <div className="flex items-center gap-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]">
                                    <input
                                        type="checkbox"
                                        checked={court.is_active}
                                        onChange={(e) =>
                                            updateCourt(idx, {
                                                is_active: e.target.checked,
                                            })
                                        }
                                        className="size-4 rounded border-[#3e2817]/25 accent-[#166534]"
                                    />
                                    {court.is_active ? 'Active' : 'Inactive'}
                                </label>
                                {courts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCourt(idx)}
                                        className="h-8 gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#991b1b] hover:bg-[#fee2e2] hover:text-[#7f1d1d]"
                                    >
                                        <Trash2
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Field
                            label="Court name"
                            htmlFor={`court-${idx}-name`}
                            error={errors[`courts.${idx}.name`]}
                            required
                            hint="e.g. Court 1, Main Court, Court A"
                        >
                            <Input
                                id={`court-${idx}-name`}
                                value={court.name}
                                onChange={(e) =>
                                    updateCourt(idx, { name: e.target.value })
                                }
                                className={INPUT_CLASS}
                            />
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <Field
                                label="Surface type"
                                htmlFor={`court-${idx}-surface`}
                                error={errors[`courts.${idx}.surface_type`]}
                            >
                                <Select
                                    value={court.surface_type}
                                    onValueChange={(v) =>
                                        updateCourt(idx, { surface_type: v })
                                    }
                                >
                                    <SelectTrigger
                                        id={`court-${idx}-surface`}
                                        className="h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0"
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
                            </Field>

                            <Field
                                label="Price per hour (₱)"
                                htmlFor={`court-${idx}-rate`}
                                error={errors[`courts.${idx}.hourly_rate`]}
                                required
                            >
                                <Input
                                    id={`court-${idx}-rate`}
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="50"
                                    value={court.hourly_rate}
                                    onChange={(e) =>
                                        updateCourt(idx, {
                                            hourly_rate: e.target.value,
                                        })
                                    }
                                    placeholder="350"
                                    className={INPUT_CLASS}
                                />
                            </Field>

                            <Field
                                label="Slot length"
                                htmlFor={`court-${idx}-slot`}
                                error={errors[`courts.${idx}.slot_minutes`]}
                            >
                                <Select
                                    value={court.slot_minutes}
                                    onValueChange={(v) =>
                                        updateCourt(idx, { slot_minutes: v })
                                    }
                                >
                                    <SelectTrigger
                                        id={`court-${idx}-slot`}
                                        className="h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0"
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
                            </Field>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]">
                    {courts.length} {courts.length === 1 ? 'court' : 'courts'}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={addCourt}
                    disabled={courts.length >= 20}
                    className="h-9 gap-1.5 rounded-md border border-dashed border-[#3e2817]/30 px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] hover:bg-[#faf5ec]"
                >
                    <Plus className="size-3.5" aria-hidden />
                    Add court
                </Button>
            </div>

            <InputError
                message={errors.courts}
                className="text-xs text-red-700"
            />
        </div>
    );
}

/* ── Step: Review ───────────────────────────────────────────────────── */

function ReviewStep({
    data,
    amenityOptions,
    surfaceTypes,
    onJumpTo,
}: {
    data: WizardData;
    amenityOptions: Option[];
    surfaceTypes: Option[];
    onJumpTo: (key: StepKey) => void;
}) {
    const amenityLabels = useMemo(
        () =>
            data.amenities
                .map((v) => amenityOptions.find((o) => o.value === v)?.label)
                .filter(Boolean) as string[],
        [data.amenities, amenityOptions],
    );

    const surfaceLabel = (value: string) =>
        surfaceTypes.find((s) => s.value === value)?.label ?? value;

    return (
        <div className="space-y-8">
            <SectionTitle
                title="Review & submit"
                subtitle="Review the details before submitting for approval."
            />

            <ReviewCard
                title="Basic info"
                onEdit={() => onJumpTo('basic')}
                rows={[
                    ['Name', data.name || '—'],
                    ['Description', data.description || '—'],
                    [
                        'Advance booking',
                        `${data.advance_booking_weeks} ${
                            data.advance_booking_weeks === '1'
                                ? 'week'
                                : 'weeks'
                        }`,
                    ],
                    [
                        'Amenities',
                        amenityLabels.length > 0
                            ? amenityLabels.join(' · ')
                            : 'None selected',
                    ],
                ]}
            />

            <ReviewCard
                title="Location"
                onEdit={() => onJumpTo('location')}
                rows={[
                    ['Address', data.address_line || '—'],
                    ['Barangay', data.barangay || '—'],
                    [
                        'City / Province',
                        `${data.city}, ${data.province}`,
                    ],
                    ['Region', data.region],
                    ['Postal code', data.postal_code || '—'],
                    ['Maps link', data.google_maps_url || '—'],
                ]}
            />

            <ReviewCard
                title="Contact"
                onEdit={() => onJumpTo('contact')}
                rows={[
                    ['Email', data.contact_email || '—'],
                    ['Phone', data.contact_phone || '—'],
                    ['Facebook', data.facebook_url || '—'],
                    ['Instagram', data.instagram_url || '—'],
                    ['Twitter / X', data.twitter_url || '—'],
                    ['TikTok', data.tiktok_url || '—'],
                    ['Website', data.website_url || '—'],
                ]}
            />

            <div className="overflow-hidden rounded-md border border-[#3e2817]/15 bg-white">
                <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                        Courts ({data.courts.length})
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onJumpTo('courts')}
                        className="h-7 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] hover:text-[#f37021]"
                    >
                        Edit
                    </Button>
                </div>
                <ul className="divide-y divide-[#3e2817]/10">
                    {data.courts.map((c, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between gap-4 px-5 py-3"
                        >
                            <div>
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    {c.name || `Court ${i + 1}`}
                                </p>
                                <p className="text-[11px] text-[#5c3a21]">
                                    {c.surface_type
                                        ? surfaceLabel(c.surface_type)
                                        : 'Surface — not set'}{' '}
                                    · {c.slot_minutes || 60}-min slots
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                    ₱{c.hourly_rate || '0'}
                                    <span className="text-[10px] tracking-[0.18em] text-[#5c3a21]">
                                        {' '}
                                        / HR
                                    </span>
                                </p>
                                <p
                                    className={cn(
                                        'text-[9px] uppercase tracking-[0.22em]',
                                        c.is_active
                                            ? 'text-[#166534]'
                                            : 'text-[#5c3a21]/65',
                                    )}
                                >
                                    {c.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="rounded-md border border-[#3e2817]/15 bg-[#faf5ec] px-4 py-3 text-xs text-[#5c3a21]">
                Once submitted, your venue will be reviewed by a sportify
                <span className="italic text-[#f37021]">.ph</span> admin
                before going live in the directory.
            </p>
        </div>
    );
}

function ReviewCard({
    title,
    rows,
    onEdit,
}: {
    title: string;
    rows: Array<[string, string]>;
    onEdit: () => void;
}) {
    return (
        <div className="overflow-hidden rounded-md border border-[#3e2817]/15 bg-white">
            <div className="flex items-center justify-between border-b border-[#3e2817]/12 px-5 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                    {title}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-7 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] hover:text-[#f37021]"
                >
                    Edit
                </Button>
            </div>
            <dl className="divide-y divide-[#3e2817]/10">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="grid gap-1 px-5 py-3 sm:grid-cols-[160px_1fr]"
                    >
                        <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                            {label}
                        </dt>
                        <dd className="font-serif text-sm text-[#3e2817] sm:text-right">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/* ── Footer (prev / next / submit) ──────────────────────────────────── */

function Footer({
    stepIndex,
    processing,
    onPrev,
    onNext,
    onSubmit,
}: {
    stepIndex: number;
    processing: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
}) {
    const isLast = stepIndex === STEPS.length - 1;
    const isFirst = stepIndex === 0;

    return (
        <div className="flex items-center justify-between border-t border-[#3e2817]/12 pt-6">
            <Button
                type="button"
                variant="ghost"
                onClick={onPrev}
                disabled={isFirst || processing}
                className="h-9 gap-2 rounded-md px-4 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21] hover:text-[#3e2817] disabled:opacity-40"
            >
                <ArrowLeft className="size-3.5" aria-hidden />
                Previous
            </Button>

            {isLast ? (
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={processing}
                    className="h-10 gap-2 rounded-md bg-[#3e2817] px-6 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-chocolate-deep disabled:opacity-60"
                >
                    {processing ? <Spinner /> : <Check className="size-3.5" />}
                    Submit for approval
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={onNext}
                    className="h-10 gap-2 rounded-md bg-[#3e2817] px-6 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-chocolate-deep"
                >
                    Next
                    <ArrowRight className="size-3.5" aria-hidden />
                </Button>
            )}
        </div>
    );
}

/* ── Shared bits ────────────────────────────────────────────────────── */

const INPUT_CLASS =
    'h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

function SectionTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-[#3e2817]">
                {title}
            </h2>
            <p className="font-serif text-sm text-[#5c3a21]">{subtitle}</p>
        </div>
    );
}

function Field({
    label,
    htmlFor,
    error,
    children,
    hint,
    required,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
    hint?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
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

function emptyCourt(index = 1): CourtRow {
    return {
        name: `Court ${index}`,
        surface_type: '',
        hourly_rate: '',
        slot_minutes: '60',
        is_active: true,
    };
}
