import { Head } from '@inertiajs/react';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import Heading from '@/components/heading';
import { PaymentStatusBadge } from '@/components/payment/payment-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    booking: Models.Booking;
};

export default function VenueAdminBookingsShow({ booking }: Props) {
    const courtName = booking.court?.name ?? 'Court';

    return (
        <>
            <Head title={`Booking — ${courtName}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={courtName}
                    description={booking.court?.venue?.name ?? undefined}
                />

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <CardTitle>Booking</CardTitle>
                        <BookingStatusBadge status={booking.status} />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <span className="text-muted-foreground">Player:</span>{' '}
                            {booking.user?.name ?? `User #${booking.user_id}`}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Starts:</span>{' '}
                            {formatInManila(booking.starts_at)}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Ends:</span>{' '}
                            {formatInManila(booking.ends_at)}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Total:</span>{' '}
                            <span className="font-medium">
                                {formatPHP(booking.total_amount)}
                            </span>
                        </p>
                        {booking.notes && (
                            <p>
                                <span className="text-muted-foreground">Notes:</span>{' '}
                                {booking.notes}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {booking.payment && (
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <CardTitle>Payment</CardTitle>
                            <PaymentStatusBadge status={booking.payment.status} />
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">Amount:</span>{' '}
                                {formatPHP(booking.payment.amount)}
                            </p>
                            {booking.payment.reference_number && (
                                <p>
                                    <span className="text-muted-foreground">Reference:</span>{' '}
                                    {booking.payment.reference_number}
                                </p>
                            )}
                            {booking.payment.proof_url && (
                                <a
                                    href={booking.payment.proof_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    View proof image
                                </a>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
