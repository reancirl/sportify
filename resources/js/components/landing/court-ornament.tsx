/**
 * CourtOrnament — tactical court diagram backdrop for the hero.
 *
 * Structure:
 *   - Outer boundary (heavy chocolate stroke)
 *   - Kitchen/non-volley zone lines (precise)
 *   - Service boxes + center line
 *   - Net line (thicker hermes stroke, hard right-angle T-posts)
 *   - Diagonal speed lines (3 thin hermes lines at ~25°) bleeding off upper-right
 *   - Perpetually bouncing ball — sharper parabola, faster ease (power2)
 *
 * Animate ball: flatter arc, faster timing, zero wobble.
 * Pause when hero is off-screen via ScrollTrigger.
 * Reduce-motion: ball static.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { forwardRef, useRef } from 'react';
import type { MutableRefObject } from 'react';

type Ref = SVGSVGElement | null;

const CourtOrnament = forwardRef<SVGSVGElement>((_, outerRef) => {
    const innerRef = useRef<SVGSVGElement>(null);
    const ballRef = useRef<SVGCircleElement>(null);

    const mergedRef = (node: SVGSVGElement | null) => {
        (innerRef as MutableRefObject<SVGSVGElement | null>).current = node;
        if (typeof outerRef === 'function') {
            outerRef(node);
        } else if (outerRef) {
            (outerRef as MutableRefObject<Ref>).current = node;
        }
    };

    useGSAP(
        () => {
            const ball = ballRef.current;
            const wrap = innerRef.current;
            if (!ball || !wrap) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // Horizontal: ball slides left → right → left (yoyo), faster
                const xTl = gsap.timeline({ repeat: -1, yoyo: true });
                xTl.to(ball, {
                    attr: { cx: 170 },
                    duration: 1.3,
                    ease: 'power2.inOut',
                });

                // Vertical: flatter parabola — sharper, more athletic bounce
                const yTl = gsap.timeline({ repeat: -1 });
                yTl.to(ball, {
                    attr: { cy: 78 },
                    duration: 0.55,
                    ease: 'power2.out',
                });
                yTl.to(ball, {
                    attr: { cy: 108 },
                    duration: 0.55,
                    ease: 'power2.in',
                });

                // Pause when hero leaves viewport
                const heroEl = wrap.closest('section');
                if (heroEl) {
                    ScrollTrigger.create({
                        trigger: heroEl,
                        start: 'top bottom',
                        end: 'bottom top',
                        onLeave: () => { xTl.pause(); yTl.pause(); },
                        onEnterBack: () => { xTl.resume(); yTl.resume(); },
                        onLeaveBack: () => { xTl.pause(); yTl.pause(); },
                        onEnter: () => { xTl.resume(); yTl.resume(); },
                    });
                }

                return () => {
                    xTl.kill();
                    yTl.kill();
                    mm.revert();
                };
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                return () => mm.revert();
            });
        },
        { scope: innerRef },
    );

    return (
        <svg
            ref={mergedRef}
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-12 hidden h-[680px] w-[680px] opacity-[0.11] lg:block"
            viewBox="0 0 220 220"
            fill="none"
        >
            {/* ── Outer court boundary — heavy stroke ─────────────────── */}
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                stroke="var(--color-chocolate)"
                strokeWidth="1.2"
                strokeLinecap="square"
            />

            {/* ── Net line — thicker hermes stroke + T-posts ───────────── */}
            <line
                x1="10"
                y1="100"
                x2="190"
                y2="100"
                stroke="var(--color-hermes)"
                strokeWidth="1.8"
                strokeLinecap="square"
            />
            {/* T-post left */}
            <line
                x1="10"
                y1="94"
                x2="10"
                y2="106"
                stroke="var(--color-hermes)"
                strokeWidth="2.2"
                strokeLinecap="square"
            />
            {/* T-post right */}
            <line
                x1="190"
                y1="94"
                x2="190"
                y2="106"
                stroke="var(--color-hermes)"
                strokeWidth="2.2"
                strokeLinecap="square"
            />

            {/* ── Kitchen / non-volley zone lines ─────────────────────── */}
            {/* Top kitchen line */}
            <line
                x1="10"
                y1="70"
                x2="190"
                y2="70"
                stroke="var(--color-chocolate)"
                strokeWidth="0.7"
                strokeLinecap="square"
            />
            {/* Bottom kitchen line */}
            <line
                x1="10"
                y1="130"
                x2="190"
                y2="130"
                stroke="var(--color-chocolate)"
                strokeWidth="0.7"
                strokeLinecap="square"
            />

            {/* ── Center line (service boxes) ──────────────────────────── */}
            <line
                x1="100"
                y1="10"
                x2="100"
                y2="190"
                stroke="var(--color-chocolate)"
                strokeWidth="0.6"
                strokeLinecap="square"
            />

            {/* ── Service box back lines ───────────────────────────────── */}
            <line
                x1="10"
                y1="40"
                x2="190"
                y2="40"
                stroke="var(--color-chocolate)"
                strokeWidth="0.5"
                strokeLinecap="square"
            />
            <line
                x1="10"
                y1="160"
                x2="190"
                y2="160"
                stroke="var(--color-chocolate)"
                strokeWidth="0.5"
                strokeLinecap="square"
            />

            {/* ── Diagonal speed lines — upper-right, ~25° ────────────── */}
            {/* These bleed off the upper-right corner suggesting motion */}
            <line
                x1="155"
                y1="10"
                x2="220"
                y2="-28"
                stroke="var(--color-hermes)"
                strokeWidth="0.6"
                strokeLinecap="square"
                opacity="0.7"
            />
            <line
                x1="170"
                y1="10"
                x2="235"
                y2="-28"
                stroke="var(--color-hermes)"
                strokeWidth="0.4"
                strokeLinecap="square"
                opacity="0.5"
            />
            <line
                x1="185"
                y1="10"
                x2="250"
                y2="-28"
                stroke="var(--color-hermes)"
                strokeWidth="0.3"
                strokeLinecap="square"
                opacity="0.3"
            />

            {/* ── Animated ball — starts near left of court, above net ── */}
            <circle
                ref={ballRef}
                cx="30"
                cy="93"
                r="3.5"
                fill="var(--color-hermes)"
                opacity="1"
            />
            {/* Ball shadow/squash indicator on ground */}
            <ellipse
                cx="30"
                cy="108"
                rx="3"
                ry="1"
                fill="var(--color-chocolate)"
                opacity="0.3"
            />
        </svg>
    );
});

CourtOrnament.displayName = 'CourtOrnament';

export { CourtOrnament };
