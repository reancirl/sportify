import { useForm } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Models } from '@/types';

type VenueFormData = {
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

    contact_phone: string;
    contact_email: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    tiktok_url: string;
    website_url: string;
};

type Props = {
    venue?: Models.Venue;
    submitUrl: string;
    method?: 'post' | 'put' | 'patch';
    submitLabel?: string;
    amenities?: { value: string; label: string }[];
};

const INPUT_CLASS =
    'h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

export function VenueForm({
    venue,
    submitUrl,
    method = 'post',
    submitLabel = 'Save venue',
    amenities = [],
}: Props) {
    const form = useForm<VenueFormData>({
        name: venue?.name ?? '',
        description: venue?.description ?? '',
        amenities: venue?.amenities ?? [],
        advance_booking_weeks:
            venue?.advance_booking_weeks?.toString() ?? '4',

        address_line: venue?.address_line ?? '',
        barangay: venue?.barangay ?? '',
        city: venue?.city ?? 'Iligan City',
        province: venue?.province ?? 'Lanao del Norte',
        region: venue?.region ?? 'Northern Mindanao',
        postal_code: venue?.postal_code ?? '',
        google_maps_url: venue?.google_maps_url ?? '',

        contact_phone: venue?.contact_phone ?? '',
        contact_email: venue?.contact_email ?? '',
        facebook_url: venue?.facebook_url ?? '',
        instagram_url: venue?.instagram_url ?? '',
        twitter_url: venue?.twitter_url ?? '',
        tiktok_url: venue?.tiktok_url ?? '',
        website_url: venue?.website_url ?? '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((d) => ({
            ...d,
            advance_booking_weeks: parseInt(d.advance_booking_weeks, 10) || 4,
        }));
        form.submit(method, submitUrl, { preserveScroll: true });
    };

    const toggleAmenity = (value: string) => {
        const next = form.data.amenities.includes(value)
            ? form.data.amenities.filter((a) => a !== value)
            : [...form.data.amenities, value];
        form.setData('amenities', next);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <Section title="Basic info">
                <Field label="Venue name" htmlFor="name" error={form.errors.name} required>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </Field>

                <Field
                    label="Description"
                    htmlFor="description"
                    error={form.errors.description}
                >
                    <Textarea
                        id="description"
                        rows={4}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                    />
                </Field>

                <Field
                    label="Advance booking window"
                    htmlFor="advance"
                    error={form.errors.advance_booking_weeks}
                    hint="How far ahead members can book."
                >
                    <Select
                        value={form.data.advance_booking_weeks}
                        onValueChange={(v) =>
                            form.setData('advance_booking_weeks', v)
                        }
                    >
                        <SelectTrigger
                            id="advance"
                            className={cn(INPUT_CLASS, 'w-44')}
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

                {amenities.length > 0 && (
                    <div>
                        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                            Amenities
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {amenities.map((amenity) => {
                                const checked = form.data.amenities.includes(
                                    amenity.value,
                                );

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
                    </div>
                )}
            </Section>

            <Section title="Location">
                <Field
                    label="Address"
                    htmlFor="address_line"
                    error={form.errors.address_line}
                    required
                >
                    <Input
                        id="address_line"
                        value={form.data.address_line}
                        onChange={(e) =>
                            form.setData('address_line', e.target.value)
                        }
                        className={INPUT_CLASS}
                    />
                </Field>

                <Field
                    label="Barangay"
                    htmlFor="barangay"
                    error={form.errors.barangay}
                >
                    <Input
                        id="barangay"
                        value={form.data.barangay}
                        onChange={(e) =>
                            form.setData('barangay', e.target.value)
                        }
                        className={INPUT_CLASS}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                        label="City"
                        htmlFor="city"
                        error={form.errors.city}
                        required
                    >
                        <Input
                            id="city"
                            value={form.data.city}
                            onChange={(e) =>
                                form.setData('city', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                    <Field
                        label="Province"
                        htmlFor="province"
                        error={form.errors.province}
                        required
                    >
                        <Input
                            id="province"
                            value={form.data.province}
                            onChange={(e) =>
                                form.setData('province', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                    <Field
                        label="Region"
                        htmlFor="region"
                        error={form.errors.region}
                        required
                    >
                        <Input
                            id="region"
                            value={form.data.region}
                            onChange={(e) =>
                                form.setData('region', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Postal code"
                        htmlFor="postal_code"
                        error={form.errors.postal_code}
                    >
                        <Input
                            id="postal_code"
                            value={form.data.postal_code}
                            onChange={(e) =>
                                form.setData('postal_code', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                    <Field
                        label="Google Maps link"
                        htmlFor="google_maps_url"
                        error={form.errors.google_maps_url}
                    >
                        <Input
                            id="google_maps_url"
                            value={form.data.google_maps_url}
                            onChange={(e) =>
                                form.setData('google_maps_url', e.target.value)
                            }
                            placeholder="https://maps.google.com/…"
                            className={INPUT_CLASS}
                        />
                    </Field>
                </div>
            </Section>

            <Section title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Email"
                        htmlFor="contact_email"
                        error={form.errors.contact_email}
                    >
                        <Input
                            id="contact_email"
                            type="email"
                            value={form.data.contact_email}
                            onChange={(e) =>
                                form.setData('contact_email', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                    <Field
                        label="Phone"
                        htmlFor="contact_phone"
                        error={form.errors.contact_phone}
                    >
                        <Input
                            id="contact_phone"
                            type="tel"
                            value={form.data.contact_phone}
                            onChange={(e) =>
                                form.setData('contact_phone', e.target.value)
                            }
                            className={INPUT_CLASS}
                        />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                            error={
                                form.errors[
                                    key as keyof typeof form.errors
                                ] as string | undefined
                            }
                        >
                            <Input
                                id={key}
                                value={form.data[key]}
                                onChange={(e) =>
                                    form.setData(key, e.target.value)
                                }
                                placeholder="https://…"
                                className={INPUT_CLASS}
                            />
                        </Field>
                    ))}
                </div>
            </Section>

            <Button
                type="submit"
                disabled={form.processing}
                className="h-10 gap-2 rounded-md bg-[#3e2817] px-6 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#2a1a0e] disabled:opacity-60"
            >
                {form.processing && <Spinner />}
                {submitLabel}
            </Button>
        </form>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-5 border-b border-[#3e2817]/10 pb-8 last:border-0 last:pb-0">
            <h2 className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                {title}
            </h2>
            {children}
        </section>
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
    children: React.ReactNode;
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
