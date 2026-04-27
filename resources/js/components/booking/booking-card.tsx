import { Link } from '@inertiajs/react';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    booking: Models.Booking;
};

export function BookingCard({ booking }: Props) {
    const courtName = booking.court?.name ?? 'Court';
    const venueName = booking.court?.venue?.name;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">{courtName}</CardTitle>
                    {venueName && (
                        <span className="text-sm text-muted-foreground">{venueName}</span>
                    )}
                </div>
                <BookingStatusBadge status={booking.status} />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p>
                    <span className="text-muted-foreground">Starts:</span>{' '}
                    {formatInManila(booking.starts_at)}
                </p>
                <p>
                    <span className="text-muted-foreground">Ends:</span>{' '}
                    {formatInManila(booking.ends_at)}
                </p>
                <p className="font-medium">
                    Total: {formatPHP(booking.total_amount)}
                </p>
            </CardContent>
            <CardFooter>
                <Link
                    href={`/bookings/${booking.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    View details
                </Link>
            </CardFooter>
        </Card>
    );
}
