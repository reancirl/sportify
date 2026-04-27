/**
 * CursorBall — main ball + trailing micro-dots forming a speed-blur tail.
 *
 * - Main ball: hermes-orange SVG, gsap.quickTo x/y (power3, 0.6s).
 * - Trailing dots: 4 micro-dots at 80ms lag increments, each smaller +
 *   more transparent than the previous — speed-blur / motion trail.
 * - Hide on touch / reduce-motion.
 * - Never renders during SSR.
 */
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Props = {
    parentRef: RefObject<HTMLElement | null>;
};

const TRAIL_COUNT = 4;
// Duration increases per dot to create increasing lag
const TRAIL_DURATIONS = [0.75, 0.9, 1.05, 1.2];
// Each dot: size and opacity decrease as index increases (further from lead)
const TRAIL_SIZES = [8, 6, 4, 3];
const TRAIL_OPACITIES = [0.55, 0.38, 0.22, 0.12];

export function CursorBall({ parentRef }: Props) {
    const ballRef = useRef<SVGSVGElement>(null);
    const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ball = ballRef.current;
        const parent = parentRef.current;
        if (!ball || !parent) {
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            return;
        }

        // Start off-screen
        gsap.set(ball, { x: -200, y: -200, opacity: 0 });
        trailRefs.current.forEach((dot) => {
            if (dot) gsap.set(dot, { x: -200, y: -200, opacity: 0 });
        });

        // quickTo setters for main ball
        const setX = gsap.quickTo(ball, 'x', { duration: 0.6, ease: 'power3.out' });
        const setY = gsap.quickTo(ball, 'y', { duration: 0.6, ease: 'power3.out' });

        // quickTo setters for each trailing dot
        const trailSetters = trailRefs.current.map((dot, i) => {
            if (!dot) return null;
            return {
                x: gsap.quickTo(dot, 'x', { duration: TRAIL_DURATIONS[i], ease: 'power3.out' }),
                y: gsap.quickTo(dot, 'y', { duration: TRAIL_DURATIONS[i], ease: 'power3.out' }),
            };
        });

        let entered = false;

        const onMove = (e: MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left - 10;
            const y = e.clientY - rect.top - 10;

            setX(x);
            setY(y);

            trailSetters.forEach((setters, i) => {
                if (!setters) return;
                const size = TRAIL_SIZES[i];
                setters.x(x + (4 - size) / 2); // center smaller dots
                setters.y(y + (4 - size) / 2);
            });

            if (!entered) {
                gsap.to(ball, { opacity: 1, duration: 0.3 });
                trailRefs.current.forEach((dot, i) => {
                    if (dot) gsap.to(dot, { opacity: TRAIL_OPACITIES[i], duration: 0.3, delay: i * 0.05 });
                });
                entered = true;
            }
        };

        const onLeave = () => {
            gsap.to(ball, { opacity: 0, duration: 0.4 });
            trailRefs.current.forEach((dot) => {
                if (dot) gsap.to(dot, { opacity: 0, duration: 0.4 });
            });
            entered = false;
        };

        parent.addEventListener('mousemove', onMove);
        parent.addEventListener('mouseleave', onLeave);

        return () => {
            parent.removeEventListener('mousemove', onMove);
            parent.removeEventListener('mouseleave', onLeave);
        };
    }, [parentRef]);

    return (
        <>
            {/* Trailing micro-dots — rendered behind the main ball */}
            {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
                <div
                    key={i}
                    ref={(el) => { trailRefs.current[i] = el; }}
                    aria-hidden
                    className="pointer-events-none absolute top-0 left-0 z-40 hidden rounded-full bg-hermes lg:block"
                    style={{
                        width: `${TRAIL_SIZES[i]}px`,
                        height: `${TRAIL_SIZES[i]}px`,
                        willChange: 'transform',
                    }}
                />
            ))}

            {/* Main cursor ball */}
            <svg
                ref={ballRef}
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 z-50 hidden lg:block"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ willChange: 'transform' }}
            >
                {/* Outer ring */}
                <circle
                    cx="10"
                    cy="10"
                    r="9"
                    stroke="var(--color-hermes)"
                    strokeWidth="1"
                    opacity="0.4"
                />
                {/* Solid core */}
                <circle cx="10" cy="10" r="5.5" fill="var(--color-hermes)" />
                {/* Specular highlight */}
                <circle cx="7.5" cy="7.5" r="1.5" fill="white" opacity="0.55" />
            </svg>
        </>
    );
}
