import { Head } from '@inertiajs/react';
import { BookingStatusBadge } from '@/components/booking/booking-status-badge';
import Heading from '@/components/heading';
import { PaymentProofUpload } from '@/components/payment/payment-proof-upload';
import { PaymentStatusBadge } from '@/components/payment/payment-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    booking: Models.Booking;
};

export default function PlayerBookingsShow({ booking }: Props) {
    const payment = booking.payment;
    const courtName = booking.court?.name ?? 'Court';
    const venueName = booking.court?.venue?.name;

    return (
        <>
            <Head title={`Booking — ${courtName}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={courtName}
                    description={venueName ?? undefined}
                />

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <CardTitle>Booking details</CardTitle>
                        <BookingStatusBadge status={booking.status} />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <span className="text-muted-foreground">Starts:</span>{' '}
                            {formatInManila(booking.starts_at)}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Ends:</span>{' '}
                            {formatInManila(booking.ends_at)}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Total amount:</span>{' '}
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

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <CardTitle>Payment</CardTitle>
                        {payment && <PaymentStatusBadge status={payment.status} />}
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {!payment ? (
                            <p className="text-muted-foreground">
                                No payment record yet.
                            </p>
                        ) : (
                            <>
                                <p>
                                    <span className="text-muted-foreground">Amount due:</span>{' '}
                                    <span className="font-medium">
                                        {formatPHP(payment.amount)}
                                    </span>
                                </p>
                                {payment.reference_number && (
                                    <p>
                                        <span className="text-muted-foreground">Reference:</span>{' '}
                                        {payment.reference_number}
                                    </p>
                                )}
                                {payment.status === 'pending' && !payment.proof_image_path && (
                                    <PaymentProofUpload paymentId={payment.id} />
                                )}
                                {payment.status === 'rejected' && payment.rejection_reason && (
                                    <p className="text-red-700">
                                        Rejection reason: {payment.rejection_reason}
                                    </p>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
