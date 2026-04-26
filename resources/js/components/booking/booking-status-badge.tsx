import { Badge } from '@/components/ui/badge';
import type { Models } from '@/types';

type Props = {
    status: Models.BookingStatus;
    className?: string;
};

const STATUS_LABEL: Record<Models.BookingStatus, string> = {
    pending_payment: 'Pending payment',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No-show',
};

const STATUS_CLASS: Record<Models.BookingStatus, string> = {
    pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-sky-100 text-sky-800 border-sky-200',
    no_show: 'bg-zinc-200 text-zinc-800 border-zinc-300',
};

export function BookingStatusBadge({ status, className }: Props) {
    return (
        <Badge variant="outline" className={`${STATUS_CLASS[status]} ${className ?? ''}`}>
            {STATUS_LABEL[status]}
        </Badge>
    );
}
