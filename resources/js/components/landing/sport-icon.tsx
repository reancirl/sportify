/**
 * SportIcon — animated inline SVG sport icons for the sports section tiles.
 *
 * Each icon self-draws via DrawSVGPlugin when it enters the viewport (once),
 * then runs a continuous motion loop (ball bounce, shuttle sway, etc.).
 * The component selects the correct icon based on the sport name string.
 *
 * Reduce-motion: static display, no animations.
 */
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

type Props = {
    sportName: string;
    className?: string;
};

export function SportIcon({ sportName, className }: Props) {
    const name = sportName.toLowerCase();
    if (name.includes('pickle')) {
        return <PickleballIcon className={className} />;
    }
    if (name.includes('tennis')) {
        return <TennisIcon className={className} />;
    }
    if (name.includes('badminton') || name.includes('shuttle')) {
        return <BadmintonIcon className={className} />;
    }
    return <DefaultRacquetIcon className={className} />;
}

/* ── Shared draw-in hook ────────────────────────────────────────────── */

function useDrawReveal(ref: RefObject<SVGSVGElement | null>) {
    useGSAP(
        () => {
            if (!ref.current) {
                return;
            }

            const drawTargets = ref.current.querySelectorAll<SVGGeometryElement>('[data-draw]');
            if (drawTargets.length === 0) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.fromTo(
                    drawTargets,
                    { drawSVG: '0%' },
                    {
                        drawSVG: '100%',
                        duration: 1.5,
                        ease: 'power2.inOut',
                        stagger: 0.07,
                        scrollTrigger: {
                            trigger: ref.current,
                            start: 'top 92%',
                            once: true,
                        },
                    },
                );
                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set(drawTargets, { drawSVG: '100%' });
                return () => mm.revert();
            });
        },
        { scope: ref },
    );
}

/* ── Pickleball — paddle side-view + wiffle ball ─────────────────────── */

function PickleballIcon({ className }: { className?: string }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const ballRef = useRef<SVGGElement>(null);

    useDrawReveal(svgRef);

    useGSAP(
        () => {
            if (!ballRef.current) {
                return;
            }

            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.to(ballRef.current, {
                    y: -8,
                    duration: 0.75,
                    ease: 'power2.out',
                    repeat: -1,
                    yoyo: true,
                    delay: 1.6,
                });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 90 96"
            fill="none"
            className={cn('text-current', className)}
        >
            {/* Paddle head — wide flat oval */}
            <rect
                data-draw
                x="8"
                y="22"
                width="56"
                height="40"
                rx="10"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            {/* Paddle center divider */}
            <line
                data-draw
                x1="36"
                y1="22"
                x2="36"
                y2="62"
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.35"
            />
            {/* Horizontal grid lines */}
            <line
                data-draw
                x1="8"
                y1="34"
                x2="64"
                y2="34"
                stroke="currentColor"
                strokeWidth="0.55"
                opacity="0.35"
            />
            <line
                data-draw
                x1="8"
                y1="50"
                x2="64"
                y2="50"
                stroke="currentColor"
                strokeWidth="0.55"
                opacity="0.35"
            />
            {/* Handle */}
            <rect
                data-draw
                x="27"
                y="62"
                width="18"
                height="26"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            {/* Grip wrap */}
            <line
                data-draw
                x1="27"
                y1="70"
                x2="45"
                y2="70"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.45"
            />
            <line
                data-draw
                x1="27"
                y1="77"
                x2="45"
                y2="77"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.45"
            />
            {/* Ball group — bounces independently */}
            <g ref={ballRef}>
                {/* Wiffle ball outline */}
                <circle
                    data-draw
                    cx="76"
                    cy="16"
                    r="12"
                    stroke="var(--color-hermes)"
                    strokeWidth="1.6"
                />
                {/* Ventilation holes — filled dots */}
                <circle cx="71" cy="11" r="2" fill="var(--color-hermes)" opacity="0.6" />
                <circle cx="80" cy="12" r="2" fill="var(--color-hermes)" opacity="0.6" />
                <circle cx="83" cy="19" r="2" fill="var(--color-hermes)" opacity="0.6" />
                <circle cx="76" cy="23" r="2" fill="var(--color-hermes)" opacity="0.6" />
                <circle cx="69" cy="20" r="2" fill="var(--color-hermes)" opacity="0.6" />
            </g>
        </svg>
    );
}

/* ── Tennis — classic oval racket + fuzzy ball ───────────────────────── */

function TennisIcon({ className }: { className?: string }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const ballRef = useRef<SVGGElement>(null);

    useDrawReveal(svgRef);

    useGSAP(
        () => {
            if (!ballRef.current) {
                return;
            }

            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // Ball gently orbits around the racket head
                gsap.to(ballRef.current, {
                    rotation: 360,
                    transformOrigin: '-28px 30px',
                    duration: 10,
                    ease: 'none',
                    repeat: -1,
                    delay: 1.6,
                });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 86 90"
            fill="none"
            className={cn('text-current', className)}
        >
            {/* Racket oval frame */}
            <ellipse
                data-draw
                cx="38"
                cy="34"
                rx="28"
                ry="32"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            {/* String grid — horizontal (approximate oval bounds) */}
            <line
                data-draw
                x1="14"
                y1="20"
                x2="62"
                y2="20"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="10"
                y1="28"
                x2="66"
                y2="28"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="10"
                y1="36"
                x2="66"
                y2="36"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="10"
                y1="44"
                x2="66"
                y2="44"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="14"
                y1="52"
                x2="62"
                y2="52"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            {/* String grid — vertical */}
            <line
                data-draw
                x1="22"
                y1="4"
                x2="22"
                y2="64"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="30"
                y1="3"
                x2="30"
                y2="65"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="38"
                y1="2"
                x2="38"
                y2="66"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="46"
                y1="3"
                x2="46"
                y2="65"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            <line
                data-draw
                x1="54"
                y1="4"
                x2="54"
                y2="64"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.38"
            />
            {/* Throat piece */}
            <path
                data-draw
                d="M 28,66 Q 38,74 48,66"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            {/* Handle shaft */}
            <line
                data-draw
                x1="38"
                y1="74"
                x2="38"
                y2="88"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
            />
            {/* Ball — orbiting */}
            <g ref={ballRef}>
                <circle
                    cx="72"
                    cy="8"
                    r="10"
                    stroke="var(--color-hermes)"
                    strokeWidth="1.5"
                />
                {/* Ball seam curves */}
                <path
                    d="M 64,5 Q 72,8 64,12"
                    stroke="var(--color-hermes)"
                    strokeWidth="1.1"
                    opacity="0.65"
                />
                <path
                    d="M 80,5 Q 72,8 80,12"
                    stroke="var(--color-hermes)"
                    strokeWidth="1.1"
                    opacity="0.65"
                />
            </g>
        </svg>
    );
}

/* ── Badminton — proper shuttlecock cone silhouette ─────────────────── */

function BadmintonIcon({ className }: { className?: string }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useDrawReveal(svgRef);

    useGSAP(
        () => {
            if (!svgRef.current) {
                return;
            }

            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.to(svgRef.current, {
                    rotate: 5,
                    duration: 2.2,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    transformOrigin: '40px 78px',
                    delay: 1.8,
                });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 80 90"
            fill="none"
            className={cn('text-current', className)}
        >
            {/* Cork base — dome/hemisphere shape */}
            <path
                data-draw
                d="M 32,84 Q 28,78 28,72 Q 28,63 40,63 Q 52,63 52,72 Q 52,78 48,84 Z"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            {/* Cork seam line */}
            <line
                data-draw
                x1="28"
                y1="72"
                x2="52"
                y2="72"
                stroke="currentColor"
                strokeWidth="0.7"
                opacity="0.4"
            />
            {/* LEFT outer edge of feather cone — curves outward from cork to ring */}
            <path
                data-draw
                d="M 33,63 Q 20,46 10,17"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            {/* RIGHT outer edge of feather cone — curves outward */}
            <path
                data-draw
                d="M 47,63 Q 60,46 70,17"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            {/* Feather tips ring — hermes orange, the icon's money shot */}
            <ellipse
                data-draw
                cx="40"
                cy="16"
                rx="30"
                ry="7"
                stroke="var(--color-hermes)"
                strokeWidth="1.6"
            />
            {/* Interior feather shafts — from cork center up to ring */}
            <line data-draw x1="40" y1="63" x2="14" y2="17" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            <line data-draw x1="40" y1="63" x2="24" y2="11" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            <line data-draw x1="40" y1="63" x2="40" y2="9"  stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
            <line data-draw x1="40" y1="63" x2="56" y2="11" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            <line data-draw x1="40" y1="63" x2="66" y2="17" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            {/* Mid-feather detail arc */}
            <path
                data-draw
                d="M 22,40 Q 31,33 40,31 Q 49,33 58,40"
                stroke="currentColor"
                strokeWidth="0.65"
                opacity="0.32"
            />
        </svg>
    );
}

/* ── Default — generic racquet + ball ───────────────────────────────── */

function DefaultRacquetIcon({ className }: { className?: string }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const ballRef = useRef<SVGCircleElement>(null);

    useDrawReveal(svgRef);

    useGSAP(
        () => {
            if (!ballRef.current) {
                return;
            }

            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.to(ballRef.current, {
                    y: -6,
                    duration: 0.85,
                    ease: 'power2.out',
                    repeat: -1,
                    yoyo: true,
                    delay: 1.6,
                });
                return () => mm.revert();
            });
        },
        { scope: svgRef },
    );

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox="0 0 84 88"
            fill="none"
            className={cn('text-current', className)}
        >
            <ellipse
                data-draw
                cx="38"
                cy="33"
                rx="27"
                ry="31"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <line data-draw x1="11" y1="21" x2="65" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <line data-draw x1="11" y1="33" x2="65" y2="33" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <line data-draw x1="11" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <line data-draw x1="24" y1="4"  x2="24" y2="62" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <line data-draw x1="38" y1="2"  x2="38" y2="64" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <line data-draw x1="52" y1="4"  x2="52" y2="62" stroke="currentColor" strokeWidth="0.5" opacity="0.38" />
            <path data-draw d="M 28,64 Q 38,72 48,64" stroke="currentColor" strokeWidth="1.8" />
            <line data-draw x1="38" y1="72" x2="38" y2="86" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
            <circle
                ref={ballRef}
                cx="72"
                cy="12"
                r="10"
                stroke="var(--color-hermes)"
                strokeWidth="1.6"
            />
        </svg>
    );
}
