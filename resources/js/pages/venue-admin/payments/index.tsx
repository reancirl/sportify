import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PaginationNav } from '@/components/pagination-nav';
import { PaymentStatusBadge } from '@/components/payment/payment-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
    payments: Models.PaginatedResponse<Models.Payment>;
};

type RejectFormData = {
    rejection_reason: string;
};

function VerifyButton({
    venueId,
    paymentId,
}: {
    venueId: string;
    paymentId: string;
}) {
    const form = useForm({});
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            `/venue-admin/venues/${venueId}/payments/${paymentId}/verify`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <Button type="submit" size="sm" disabled={form.processing}>
                {form.processing && <Spinner />}
                Verify
            </Button>
        </form>
    );
}

function RejectForm({
    venueId,
    paymentId,
}: {
    venueId: string;
    paymentId: string;
}) {
    const form = useForm<RejectFormData>({ rejection_reason: '' });
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(
            `/venue-admin/venues/${venueId}/payments/${paymentId}/reject`,
            {
                preserveScroll: true,
                onSuccess: () => form.reset(),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="grid gap-1">
                <Label htmlFor={`reject-${paymentId}`} className="text-xs">
                    Reason
                </Label>
                <Input
                    id={`reject-${paymentId}`}
                    value={form.data.rejection_reason}
                    onChange={(event) =>
                        form.setData('rejection_reason', event.target.value)
                    }
                    placeholder="Why is this payment rejected?"
                    className="w-64"
                />
            </div>
            <Button
                type="submit"
                size="sm"
                variant="destructive"
                disabled={form.processing}
            >
                {form.processing && <Spinner />}
                Reject
            </Button>
        </form>
    );
}

export default function VenueAdminPaymentsIndex({ venue, payments }: Props) {
    return (
        <>
            <Head title={`${venue.name} — payments`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                {payments.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No payments awaiting verification.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {payments.data.map((payment) => (
                            <Card key={payment.id}>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-base">
                                            {formatPHP(payment.amount)}
                                        </CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                            {payment.user?.name ?? `User #${payment.user_id}`} •{' '}
                                            {formatInManila(payment.created_at)}
                                        </span>
                                    </div>
                                    <PaymentStatusBadge status={payment.status} />
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {payment.reference_number && (
                                        <p>
                                            <span className="text-muted-foreground">Reference:</span>{' '}
                                            {payment.reference_number}
                                        </p>
                                    )}
                                    {payment.proof_url && (
                                        <a
                                            href={payment.proof_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block text-primary hover:underline"
                                        >
                                            View proof image
                                        </a>
                                    )}
                                    {payment.status === 'pending' && (
                                        <div className="flex flex-wrap items-end gap-3 pt-2">
                                            <VerifyButton
                                                venueId={venue.id}
                                                paymentId={payment.id}
                                            />
                                            <RejectForm
                                                venueId={venue.id}
                                                paymentId={payment.id}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <PaginationNav paginated={payments} />
            </div>
        </>
    );
}
