import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { twMerge } from 'tailwind-merge';

export const MANILA_TZ = 'Asia/Manila';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatInManila(
    iso: string | null | undefined,
    pattern = 'PPp',
): string {
    if (!iso) {
        return '';
    }

    return formatInTimeZone(iso, MANILA_TZ, pattern);
}

export function formatPHP(amount: string | number | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }

    const num = typeof amount === 'string' ? Number(amount) : amount;

    if (Number.isNaN(num)) {
        return '₱0.00';
    }

    return `₱${num.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDate(date: string | null | undefined, pattern = 'PP'): string {
    if (!date) {
        return '';
    }

    return format(new Date(date), pattern);
}
