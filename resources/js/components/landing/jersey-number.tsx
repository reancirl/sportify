/**
 * JerseyNumber — section index displayed as a player bib / jersey number.
 *
 * Visual: huge Geist Black numeral in hermes color, framed in a
 * chocolate-bordered square — like a referee bib or court number plate.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    number: string;
    className?: string;
};

export function JerseyNumber({ number, className }: Props) {
    return (
        <div
            className={cn(
                'inline-flex h-14 w-14 shrink-0 items-center justify-center border-2 border-chocolate/25 bg-cream',
                className,
            )}
            aria-hidden
        >
            <span className="font-sans text-3xl font-black leading-none tracking-[-0.05em] text-hermes">
                {number}
            </span>
        </div>
    );
}
