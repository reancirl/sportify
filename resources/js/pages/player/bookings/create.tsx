import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { TimeSlotPicker } from '@/components/booking/time-slot-picker';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Selected = {
    venue_id?: string;
    court_id?: string;
    date?: string;
};

type Props = {
    venues: Models.Venue[];
    selected: Selected;
    court: Models.Court | null;
    slots: string[];
};

type BookingForm = {
    court_id: string;
    starts_at: string;
    notes: string;
};

export default function PlayerBookingsCreate({
    venues,
    selected,
    court,
    slots,
}: Props) {
    const form = useForm<BookingForm>({
        court_id: court?.id ?? '',
        starts_at: '',
        notes: '',
    });

    const handleVenueChange = (venueId: string) => {
        router.get(
            '/player/bookings/create',
            { venue_id: venueId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleCourtChange = (courtId: string) => {
        router.get(
            '/player/bookings/create',
            {
                venue_id: selected.venue_id,
                court_id: courtId,
                date: selected.date,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDateChange = (date: string) => {
        router.get(
            '/player/bookings/create',
            {
                venue_id: selected.venue_id,
                court_id: selected.court_id,
                date,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const courts = venues.find((v) => v.id === selected.venue_id)?.courts ?? [];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/player/bookings');
    };

    return (
        <>
            <Head title="New booking" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="New booking"
                    description="Choose a venue, court, and time slot."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Step 1 — Venue and court</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="venue-select">Venue</Label>
                            <Select
                                value={selected.venue_id ?? ''}
                                onValueChange={handleVenueChange}
                            >
                                <SelectTrigger id="venue-select">
                                    <SelectValue placeholder="Choose a venue" />
                                </SelectTrigger>
                                <SelectContent>
                                    {venues.map((venue) => (
                                        <SelectItem key={venue.id} value={venue.id}>
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="court-select">Court</Label>
                            <Select
                                value={selected.court_id ?? ''}
                                onValueChange={handleCourtChange}
                                disabled={!selected.venue_id}
                            >
                                <SelectTrigger id="court-select">
                                    <SelectValue placeholder="Choose a court" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courts.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} — {formatPHP(c.hourly_rate)}/hr
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="booking-date">Date</Label>
                            <input
                                id="booking-date"
                                type="date"
                                value={selected.date ?? ''}
                                onChange={(event) => handleDateChange(event.target.value)}
                                disabled={!selected.court_id}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </CardContent>
                </Card>

                {court && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2 — Pick a time slot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {court.name} • {formatPHP(court.hourly_rate)} per hour •{' '}
                                {court.slot_minutes}-minute slots
                            </p>
                            <TimeSlotPicker
                                slots={slots}
                                selected={form.data.starts_at || null}
                                onSelect={(slot) => form.setData('starts_at', slot)}
                            />
                            <InputError message={form.errors.starts_at} />
                        </CardContent>
                    </Card>
                )}

                {court && form.data.starts_at && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3 — Confirm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="hidden"
                                    name="court_id"
                                    value={court.id}
                                    onChange={() => form.setData('court_id', court.id)}
                                />
                                <div className="grid gap-2">
                                    <Label htmlFor="booking-notes">Notes (optional)</Label>
                                    <Textarea
                                        id="booking-notes"
                                        rows={3}
                                        value={form.data.notes}
                                        onChange={(event) =>
                                            form.setData('notes', event.target.value)
                                        }
                                    />
                                    <InputError message={form.errors.notes} />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <Spinner />}
                                    Create booking
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
