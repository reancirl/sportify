import { Head, Link } from '@inertiajs/react';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import Heading from '@/components/heading';
import { PaginationNav } from '@/components/pagination-nav';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    bookings: Models.PaginatedResponse<Models.Booking>;
};

export default function PlayerBookingsIndex({ bookings }: Props) {
    return (
        <>
            <Head title="My bookings" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="My bookings"
                        description="All your court reservations."
                    />
                    <Button asChild>
                        <Link href="/bookings/create">New booking</Link>
                    </Button>
                </div>

                {bookings.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        You have no bookings yet. Browse venues to make your first
                        reservation.
                    </p>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Court</TableHead>
                                    <TableHead>Starts</TableHead>
                                    <TableHead>Ends</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.data.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            {booking.court?.name ?? 'Court'}
                                        </TableCell>
                                        <TableCell>{formatInManila(booking.starts_at)}</TableCell>
                                        <TableCell>{formatInManila(booking.ends_at)}</TableCell>
                                        <TableCell>{formatPHP(booking.total_amount)}</TableCell>
                                        <TableCell>
                                            <BookingStatusBadge status={booking.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/bookings/${booking.id}`}
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
