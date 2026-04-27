/**
 * SectionRail — fixed vertical navigation rail on the right edge (lg+ only).
 *
 * Shows 4 clickable "stations" connected by a vertical line. As the user
 * scrolls, the line fills hermes from top to bottom via strokeDashoffset
 * driven by a ScrollTrigger scrub on the document body.
 *
 * The active station scales up and glows hermes.
 *
 * Reduce-motion: stations are visible but line fill is instant (no scrub).
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type RailSection = {
    id: string;
    label: string;
    index: string;
};

type Props = {
    sections: RailSection[];
};

export function SectionRail({ sections }: Props) {
    const railRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<SVGLineElement>(null);
    const fillRef = useRef<SVGLineElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Total track height (px) — computed from section count
    const STATION_GAP = 56; // px between stations
    const trackHeight = STATION_GAP * (sections.length - 1);

    useGSAP(() => {
        if (!fillRef.current || !trackRef.current) {
            return;
        }

        const mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: no-preference)', () => {
            // Drive fill line via scrub against the whole page
            gsap.fromTo(
                fillRef.current,
                { strokeDashoffset: trackHeight },
                {
                    strokeDashoffset: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: document.body,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.6,
                        onUpdate(self) {
                            // Determine active station
                            const idx = Math.min(
                                sections.length - 1,
                                Math.floor(self.progress * sections.length),
                            );
                            setActiveIndex(idx);
                        },
                    },
                },
            );

            // Watch each section and highlight its station when visible
            sections.forEach((sec, i) => {
                const el = document.getElementById(sec.id);
                if (!el) {
                    return;
                }
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 60%',
                    end: 'bottom 60%',
                    onEnter: () => setActiveIndex(i),
                    onEnterBack: () => setActiveIndex(i),
                });
            });

            return () => mm.revert();
        });

        mm.add('(prefers-reduced-motion: reduce)', () => {
            gsap.set(fillRef.current, { strokeDashoffset: 0 });
            return () => mm.revert();
        });
    });

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const svgWidth = 24;
    const svgHeight = trackHeight + 16;
    const cx = svgWidth / 2;

    return (
        <div
            ref={railRef}
            className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center"
            aria-label="Page sections"
            role="navigation"
        >
            <svg
                aria-hidden
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                fill="none"
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{ top: '8px' }}
            >
                {/* Background track */}
                <line
                    ref={trackRef}
                    x1={cx}
                    y1={0}
                    x2={cx}
                    y2={trackHeight}
                    stroke="var(--color-chocolate)"
                    strokeWidth="1"
                    strokeOpacity="0.15"
                />
                {/* Animated fill line */}
                <line
                    ref={fillRef}
                    x1={cx}
                    y1={0}
                    x2={cx}
                    y2={trackHeight}
                    stroke="var(--color-hermes)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={trackHeight}
                    strokeDashoffset={trackHeight}
                />
            </svg>

            {/* Station buttons */}
            <div className="pointer-events-auto flex flex-col" style={{ gap: `${STATION_GAP}px` }}>
                {sections.map((sec, i) => {
                    const isActive = i === activeIndex;
                    return (
                        <button
                            key={sec.id}
                            onClick={() => scrollTo(sec.id)}
                            aria-label={`Go to section ${sec.index}: ${sec.label}`}
                            className="group relative flex items-center gap-3"
                        >
                            {/* Label tooltip on hover */}
                            <span
                                className={cn(
                                    'absolute right-full mr-3 whitespace-nowrap rounded-none border border-chocolate/15 bg-cream px-2 py-1 font-sans text-[10px] uppercase tracking-[0.18em] text-chocolate/60 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100',
                                    isActive && 'text-hermes',
                                )}
                            >
                                {sec.index} / {sec.label}
                            </span>

                            {/* Circle station */}
                            <span
                                className={cn(
                                    'flex h-2 w-2 items-center justify-center rounded-full border transition-all duration-300',
                                    isActive
                                        ? 'h-3 w-3 border-hermes bg-hermes shadow-[0_0_8px_var(--color-hermes)]'
                                        : 'border-chocolate/30 bg-cream hover:border-hermes/60',
                                )}
                                aria-hidden
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
