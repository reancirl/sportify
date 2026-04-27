/**
 * MiniCourt — editorial SVG court diagram that line-draws itself on scroll.
 *
 * Court lines start with strokeDashoffset at full length and animate to 0
 * over ~1.6s when the element enters the viewport (ScrollTrigger, once: true).
 *
 * Honors prefers-reduced-motion: lines are shown immediately at full opacity.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

type Props = {
    /** Additional class names applied to the SVG wrapper */
    className?: string;
};

export function MiniCourt({ className }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    const reduce = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useGSAP(
        () => {
            if (!svgRef.current) {
                return;
            }

            const lines = svgRef.current.querySelectorAll<SVGGeometryElement>('[data-court-line]');

            if (reduce) {
                lines.forEach((el) => {
                    el.style.strokeDashoffset = '0';
                    el.style.opacity = '1';
                });
                return;
            }

            lines.forEach((el) => {
                const len = el.getTotalLength?.() ?? 200;
                el.style.strokeDasharray = `${len}`;
                el.style.strokeDashoffset = `${len}`;
            });

            gsap.to(lines, {
                strokeDashoffset: 0,
                duration: 1.6,
                ease: 'power2.inOut',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: svgRef.current,
                    start: 'top 88%',
                    once: true,
                },
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 100 60"
            fill="none"
            className={className}
        >
            {/* Court outer boundary */}
            <rect
                data-court-line
                x="4"
                y="4"
                width="92"
                height="52"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
            />
            {/* Center line */}
            <line
                data-court-line
                x1="50"
                y1="4"
                x2="50"
                y2="56"
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.4"
            />
            {/* Service boxes left */}
            <line
                data-court-line
                x1="4"
                y1="30"
                x2="50"
                y2="30"
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.35"
            />
            {/* Service boxes right */}
            <line
                data-court-line
                x1="50"
                y1="30"
                x2="96"
                y2="30"
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.35"
            />
            {/* Net */}
            <line
                data-court-line
                x1="50"
                y1="4"
                x2="50"
                y2="56"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
                opacity="0.6"
            />
            {/* Hermes accent — inner service line */}
            <rect
                data-court-line
                x="18"
                y="4"
                width="64"
                height="52"
                stroke="var(--color-hermes)"
                strokeWidth="0.5"
                opacity="0.3"
            />
        </svg>
    );
}
