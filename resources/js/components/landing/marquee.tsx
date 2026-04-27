/**
 * Marquee — infinite horizontal scroll of editorial label items.
 *
 * Items are duplicated so xPercent: -50 produces a seamless loop.
 * Honors prefers-reduced-motion: static display when motion is reduced.
 * Pauses on pointer enter, resumes on pointer leave.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    /** Text items to repeat in the ticker */
    items: string[];
    /** Additional class names for the outer wrapper */
    className?: string;
    /** Duration in seconds for one full loop. Default 30. */
    duration?: number;
};

export function Marquee({ items, className, duration = 30 }: Props) {
    const trackRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    const reduce = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useGSAP(
        () => {
            if (!trackRef.current || reduce) {
                return;
            }

            tweenRef.current = gsap.to(trackRef.current, {
                xPercent: -50,
                duration,
                ease: 'none',
                repeat: -1,
            });
        },
        { scope: trackRef },
    );

    const handleMouseEnter = () => {
        tweenRef.current?.pause();
    };

    const handleMouseLeave = () => {
        tweenRef.current?.resume();
    };

    // Duplicate items for the seamless wrap
    const allItems = [...items, ...items];

    return (
        <div
            className={cn(
                'overflow-hidden border-y border-chocolate/15 bg-chocolate py-4',
                className,
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-hidden
        >
            <div
                ref={trackRef}
                className={cn(
                    'flex items-center whitespace-nowrap',
                    reduce && 'flex-wrap justify-center gap-4 px-6',
                )}
            >
                {allItems.map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex shrink-0 items-center gap-6 px-6 font-sans text-[0.68rem] font-medium uppercase tracking-[0.32em] text-cream/70"
                    >
                        {item}
                        <span className="text-hermes" aria-hidden>
                            ·
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
