import { Head, Link } from '@inertiajs/react';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import { PaginationNav } from '@/components/pagination-nav';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
    bookings: Models.PaginatedResponse<Models.Booking>;
};

export default function VenueAdminBookingsIndex({ venue, bookings }: Props) {
    return (
        <>
            <Head title={`${venue.name} — bookings`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                {bookings.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Court</TableHead>
                                    <TableHead>Player</TableHead>
                                    <TableHead>Starts</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.data.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            {booking.court?.name ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.user?.name ?? `User #${booking.user_id}`}
                                        </TableCell>
                                        <TableCell>{formatInManila(booking.starts_at)}</TableCell>
                                        <TableCell>{formatPHP(booking.total_amount)}</TableCell>
                                        <TableCell>
                                            <BookingStatusBadge status={booking.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/venue-admin/venues/${venue.id}/bookings/${booking.id}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <PaginationNav paginated={bookings} />
            </div>
        </>
    );
}
