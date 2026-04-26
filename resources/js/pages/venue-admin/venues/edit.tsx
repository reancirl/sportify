import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VenueForm } from '@/components/venue/venue-form';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
    amenities: { value: string; label: string }[];
};

const DAY_LABELS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export default function VenueAdminVenuesEdit({ venue, amenities }: Props) {
    return (
        <>
            <Head title={`Edit ${venue.name}`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <Card className="rounded-lg border-[#3e2817]/15 shadow-none">
                    <CardHeader>
                        <CardTitle className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                            Venue details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VenueForm
                            venue={venue}
                            submitUrl={`/venue-admin/venues/${venue.id}`}
                            method="patch"
                            submitLabel="Save changes"
                            amenities={amenities}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-[#3e2817]/15 shadow-none">
                    <CardHeader>
                        <CardTitle className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                            Operating hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!venue.operating_hours ||
                        venue.operating_hours.length === 0 ? (
                            <p className="font-serif text-sm text-[#5c3a21]">
                                No operating hours set yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-[#3e2817]/10 text-sm">
                                {venue.operating_hours.map((hour) => (
                                    <li
                                        key={hour.id}
                                        className="flex items-center justify-between py-2.5"
                                    >
                                        <span className="font-serif text-[#3e2817]">
                                            {DAY_LABELS[hour.day_of_week] ??
                                                `Day ${hour.day_of_week}`}
                                        </span>
                                        <span className="text-[#5c3a21]">
                                            {hour.is_closed
                                                ? 'Closed'
                                                : `${hour.opens_at ?? '—'} – ${hour.closes_at ?? '—'}`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-lg border-[#3e2817]/15 shadow-none">
                    <CardHeader>
                        <CardTitle className="font-display text-lg font-bold tracking-[-0.01em] text-[#3e2817]">
                            Photos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!venue.images || venue.images.length === 0 ? (
                            <p className="font-serif text-sm text-[#5c3a21]">
                                No images uploaded.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {venue.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="aspect-video overflow-hidden rounded-md border border-[#3e2817]/15 bg-[#efe6d4]"
                                    >
                                        <img
                                            src={image.image_path}
                                            alt={`Venue photo ${image.sort_order}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
