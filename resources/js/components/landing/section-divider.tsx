/**
 * SectionDivider — court baseline divider with perpendicular hash marks.
 * Replaces the wavy hand-drawn path with tournament-grade court geometry:
 * a thick horizontal baseline + evenly-spaced hash marks (tennis/pickleball
 * kitchen line style). Sharp, exact, geometric.
 *
 * Animation:
 *   - Baseline draws left→right via DrawSVGPlugin.
 *   - Hash marks pop in via stagger after baseline finishes.
 *
 * Reduce-motion: fully visible, static.
 */
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(DrawSVGPlugin);

type Props = {
    className?: string;
};

export function SectionDivider({ className }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const baselineRef = useRef<SVGLineElement>(null);
    const hashGroupRef = useRef<SVGGElement>(null);

    useGSAP(
        () => {
            if (!baselineRef.current || !hashGroupRef.current || !svgRef.current) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const hashes = hashGroupRef.current!.querySelectorAll<SVGLineElement>('line');

                // Start hashes invisible
                gsap.set(hashes, { opacity: 0 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: svgRef.current,
                        start: 'top 92%',
                        once: true,
                    },
                });

                // Baseline draws left → right
                tl.fromTo(
                    baselineRef.current,
                    { drawSVG: '0%' },
                    { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' },
                );

                // Hash marks pop in staggered after baseline
                tl.to(
                    hashes,
                    {
                        opacity: 1,
                        duration: 0.15,
                        stagger: 0.06,
                        ease: 'power1.out',
                    },
                    '-=0.2',
                );

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                const hashes = hashGroupRef.current!.querySelectorAll<SVGLineElement>('line');
                gsap.set(baselineRef.current, { drawSVG: '100%' });
                gsap.set(hashes, { opacity: 1 });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    // Hash mark positions along the baseline (as % of 1280 width)
    const hashPositions = [0, 160, 320, 480, 640, 800, 960, 1120, 1280];

    return (
        <div className={`flex items-center justify-center overflow-hidden px-6 py-3 sm:px-10 lg:px-14 ${className ?? ''}`}>
            <svg
                ref={svgRef}
                aria-hidden
                viewBox="0 0 1280 20"
                preserveAspectRatio="xMidYMid meet"
                className="w-full max-w-[1280px] opacity-50"
                fill="none"
                style={{ height: '20px' }}
            >
                {/* Thick court baseline — horizontal, precise */}
                <line
                    ref={baselineRef}
                    x1="0"
                    y1="10"
                    x2="1280"
                    y2="10"
                    stroke="var(--color-chocolate)"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                />

                {/* Perpendicular hash marks — like a tennis baseline or kitchen line */}
                <g ref={hashGroupRef}>
                    {hashPositions.map((x) => (
                        <line
                            key={x}
                            x1={x}
                            y1="4"
                            x2={x}
                            y2="16"
                            stroke="var(--color-chocolate)"
                            strokeWidth="1.5"
                            strokeLinecap="square"
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
