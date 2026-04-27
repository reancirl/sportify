/**
 * BallTrajectory — an animated ball that follows a lob-shot arc in the hero.
 *
 * - DrawSVGPlugin draws the bezier path first (stroke traces in).
 * - MotionPathPlugin sends a hermes-orange ball along that arc on loop.
 * - A faint shadow ellipse tracks the ball on the ground line.
 * - Positioned in the lower portion of the hero section.
 * - Reduce-motion: path visible, ball hidden.
 */
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import gsap from 'gsap';
import { useRef } from 'react';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

export function BallTrajectory() {
    const svgRef = useRef<SVGSVGElement>(null);
    const ballGroupRef = useRef<SVGGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const groundRef = useRef<SVGLineElement>(null);

    useGSAP(
        () => {
            const ballGroup = ballGroupRef.current;
            const path = pathRef.current;
            const ground = groundRef.current;
            if (!ballGroup || !path || !ground) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const intro = gsap.timeline({ delay: 0.5 });

                // Ground baseline draws in
                intro.fromTo(
                    ground,
                    { drawSVG: '0%' },
                    { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut' },
                );

                // Trajectory arc traces in
                intro.fromTo(
                    path,
                    { drawSVG: '0%' },
                    { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' },
                    '-=0.15',
                );

                // Ball travels along the arc, looping indefinitely
                gsap.to(ballGroup, {
                    motionPath: {
                        path: path,
                        align: path,
                        alignOrigin: [0.5, 0.5],
                        autoRotate: false,
                    },
                    duration: 2.6,
                    ease: 'power1.inOut',
                    repeat: -1,
                    delay: 1.5,
                });

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set([path, ground], { drawSVG: '100%' });
                gsap.set(ballGroup, { opacity: 0 });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 340 100"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute bottom-10 left-6 hidden w-[min(340px,40%)] opacity-[0.14] lg:block"
        >
            {/* Ground baseline */}
            <line
                ref={groundRef}
                x1="10"
                y1="88"
                x2="330"
                y2="88"
                stroke="var(--color-chocolate)"
                strokeWidth="1"
                strokeLinecap="square"
                strokeDasharray="4 7"
            />
            {/* Lob-shot trajectory arc */}
            <path
                ref={pathRef}
                d="M 20,82 C 60,18 130,6 180,28 S 280,16 320,82"
                stroke="var(--color-hermes)"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeDasharray="3 6"
            />
            {/* Ball group — follows MotionPath */}
            <g ref={ballGroupRef}>
                <circle cx="20" cy="82" r="5.5" fill="var(--color-hermes)" opacity="0.95" />
                {/* Specular highlight */}
                <circle cx="18" cy="80" r="1.8" fill="white" opacity="0.5" />
            </g>
        </svg>
    );
}
