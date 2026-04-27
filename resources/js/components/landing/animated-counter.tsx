/**
 * AnimatedCounter — counts from 0 to `to` when scrolled into view.
 *
 * Uses GSAP + ScrollTrigger. start: "top 85%", once: true.
 * Honors prefers-reduced-motion: shows final value immediately.
 * The ref'd <span> is written via onUpdate to avoid React re-renders.
 */
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { useRef } from 'react';

type Props = {
    /** Target integer to count to */
    to: number;
    /** Animation duration in seconds. Default 1.8. */
    duration?: number;
    /** Optional suffix appended after the number (e.g. "+") */
    suffix?: string;
};

export function AnimatedCounter({ to, duration = 1.8, suffix = '' }: Props) {
    const spanRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLSpanElement>(null);

    const reduce = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useGSAP(
        () => {
            if (!spanRef.current || !containerRef.current) {
                return;
            }

            if (reduce) {
                spanRef.current.textContent = `${to}${suffix}`;
                return;
            }

            const proxy = { value: 0 };

            gsap.to(proxy, {
                value: to,
                duration,
                ease: 'power2.out',
                snap: { value: 1 },
                onUpdate() {
                    if (spanRef.current) {
                        spanRef.current.textContent = `${Math.round(proxy.value)}${suffix}`;
                    }
                },
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                    once: true,
                    onEnter: () => ScrollTrigger.refresh(),
                },
            });
        },
        { scope: containerRef },
    );

    return (
        <span ref={containerRef}>
            <span ref={spanRef}>0{suffix}</span>
        </span>
    );
}
