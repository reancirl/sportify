/**
 * SlashAccent — wraps children with a sharp angled hermes chevron/slash
 * drawn as an SVG stroke above-right of the text — kinetic speed mark,
 * not a wavy underline. Sharp angles, zero wobble.
 *
 * Animates via stroke-dashoffset (DrawSVGPlugin) when in viewport.
 * Reduce-motion: static, fully visible.
 */
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import gsap from 'gsap';
import { useRef } from 'react';
import type { ReactNode } from 'react';

gsap.registerPlugin(DrawSVGPlugin);

type Props = {
    children: ReactNode;
    className?: string;
};

export function SlashAccent({ children, className }: Props) {
    const wrapRef = useRef<HTMLSpanElement>(null);
    const lineRef = useRef<SVGLineElement>(null);
    const tickRef = useRef<SVGLineElement>(null);

    useGSAP(
        () => {
            if (!lineRef.current || !tickRef.current || !wrapRef.current) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrapRef.current,
                        start: 'top 92%',
                        once: true,
                    },
                });

                tl.fromTo(
                    lineRef.current,
                    { drawSVG: '0%' },
                    { drawSVG: '100%', duration: 0.35, ease: 'power3.out' },
                );
                tl.fromTo(
                    tickRef.current,
                    { drawSVG: '0%' },
                    { drawSVG: '100%', duration: 0.2, ease: 'power3.out' },
                    '-=0.05',
                );

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set([lineRef.current, tickRef.current], { drawSVG: '100%' });
                return () => mm.revert();
            });
        },
        { scope: wrapRef },
    );

    return (
        <span
            ref={wrapRef}
            className={`relative inline-block font-black text-hermes ${className ?? ''}`}
        >
            {children}
            {/*
             * Two sharp lines forming a fast diagonal slash mark
             * positioned upper-right of the word — like a speed check mark
             * or hash mark from a referee bib.
             */}
            <svg
                aria-hidden
                className="pointer-events-none absolute -top-3 -right-3 w-6"
                viewBox="0 0 24 20"
                fill="none"
                style={{ height: '1.2em' }}
            >
                {/* Main diagonal slash */}
                <line
                    ref={lineRef}
                    x1="4"
                    y1="18"
                    x2="20"
                    y2="2"
                    stroke="var(--color-hermes)"
                    strokeWidth="2.5"
                    strokeLinecap="square"
                />
                {/* Short cross-tick at the top — makes it a check/hash mark */}
                <line
                    ref={tickRef}
                    x1="14"
                    y1="2"
                    x2="20"
                    y2="2"
                    stroke="var(--color-hermes)"
                    strokeWidth="2.5"
                    strokeLinecap="square"
                />
            </svg>
        </span>
    );
}
