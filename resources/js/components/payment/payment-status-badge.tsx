import { Badge } from '@/components/ui/badge';
import type { Models } from '@/types';

type Props = {
    status: Models.PaymentStatus;
    className?: string;
};

const STATUS_LABEL: Record<Models.PaymentStatus, string> = {
    pending: 'Pending verification',
    verified: 'Verified',
    rejected: 'Rejected',
};

const STATUS_CLASS: Record<Models.PaymentStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

export function PaymentStatusBadge({ status, className }: Props) {
    return (
        <Badge variant="outline" className={`${STATUS_CLASS[status]} ${className ?? ''}`}>
            {STATUS_LABEL[status]}
        </Badge>
    );
}
