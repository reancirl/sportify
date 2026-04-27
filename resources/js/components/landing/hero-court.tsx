import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

/**
 * Full-bleed overhead tennis/pickleball court diagram.
 * Each structural element is tagged by draw priority (outer→mid→inner→accent).
 * pathLength="1" normalises strokeDashoffset so we never compute real lengths.
 */
export function HeroCourt({ className }: { className?: string }) {
    const ref = useRef<SVGSVGElement>(null);

    useGSAP(
        () => {
            if (!ref.current) return;

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const all = ref.current.querySelectorAll<SVGElement>('[data-draw]');

            if (reduced) {
                gsap.set(all, { strokeDashoffset: 0, opacity: 1 });
                return;
            }

            const outer = ref.current.querySelectorAll('[data-draw="outer"]');
            const mid = ref.current.querySelectorAll('[data-draw="mid"]');
            const inner = ref.current.querySelectorAll('[data-draw="inner"]');
            const accent = ref.current.querySelectorAll('[data-draw="accent"]');

            const tl = gsap.timeline({ delay: 0.15 });

            tl.fromTo(
                outer,
                { strokeDashoffset: 1 },
                { strokeDashoffset: 0, duration: 2.0, ease: 'power2.inOut', stagger: 0.1 },
            )
                .fromTo(
                    mid,
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.07 },
                    '-=1.4',
                )
                .fromTo(
                    inner,
                    { strokeDashoffset: 1 },
                    { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.05 },
                    '-=1.0',
                )
                .fromTo(
                    accent,
                    { strokeDashoffset: 1, opacity: 0 },
                    { strokeDashoffset: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
                    '-=0.5',
                );
        },
        { scope: ref },
    );

    return (
        <svg
            ref={ref}
            viewBox="0 0 1200 480"
            fill="none"
            aria-hidden
            className={className}
            preserveAspectRatio="xMidYMid slice"
        >
            {/* ── OUTER: court perimeter ─────────────────────────────── */}
            <rect
                data-draw="outer"
                x="60" y="60" width="1080" height="360"
                stroke="#3e2817" strokeWidth="1.6"
                strokeDasharray="1" pathLength="1"
            />

            {/* ── MID: doubles alleys + service line verticals ──────── */}
            {/* Singles sidelines (horizontal) */}
            <line
                data-draw="mid"
                x1="60" y1="115" x2="1140" y2="115"
                stroke="#3e2817" strokeWidth="0.7" strokeOpacity="0.45"
                strokeDasharray="1" pathLength="1"
            />
            <line
                data-draw="mid"
                x1="60" y1="365" x2="1140" y2="365"
                stroke="#3e2817" strokeWidth="0.7" strokeOpacity="0.45"
                strokeDasharray="1" pathLength="1"
            />
            {/* Service lines (vertical, each half) */}
            <line
                data-draw="mid"
                x1="310" y1="115" x2="310" y2="365"
                stroke="#3e2817" strokeWidth="0.7" strokeOpacity="0.5"
                strokeDasharray="1" pathLength="1"
            />
            <line
                data-draw="mid"
                x1="890" y1="115" x2="890" y2="365"
                stroke="#3e2817" strokeWidth="0.7" strokeOpacity="0.5"
                strokeDasharray="1" pathLength="1"
            />

            {/* ── INNER: centre service lines + dashes ──────────────── */}
            {/* Centre service line — left half */}
            <line
                data-draw="inner"
                x1="310" y1="240" x2="600" y2="240"
                stroke="#3e2817" strokeWidth="0.6" strokeOpacity="0.35"
                strokeDasharray="1" pathLength="1"
            />
            {/* Centre service line — right half */}
            <line
                data-draw="inner"
                x1="600" y1="240" x2="890" y2="240"
                stroke="#3e2817" strokeWidth="0.6" strokeOpacity="0.35"
                strokeDasharray="1" pathLength="1"
            />
            {/* Baseline centre marks */}
            <line
                data-draw="inner"
                x1="60" y1="226" x2="60" y2="254"
                stroke="#3e2817" strokeWidth="1.2" strokeOpacity="0.4"
                strokeDasharray="1" pathLength="1"
            />
            <line
                data-draw="inner"
                x1="1140" y1="226" x2="1140" y2="254"
                stroke="#3e2817" strokeWidth="1.2" strokeOpacity="0.4"
                strokeDasharray="1" pathLength="1"
            />

            {/* ── ACCENT: net (hermes orange) ───────────────────────── */}
            <line
                data-draw="accent"
                x1="600" y1="48" x2="600" y2="432"
                stroke="#f37021" strokeWidth="2"
                strokeDasharray="1" pathLength="1"
            />
            {/* Net posts */}
            <circle data-draw="accent" cx="600" cy="48" r="4" fill="#f37021" opacity="0" />
            <circle data-draw="accent" cx="600" cy="432" r="4" fill="#f37021" opacity="0" />
        </svg>
    );
}

/* ── Mini court emblem — used inside the form card header ────────────── */
export function MiniCourtEmblem({ className }: { className?: string }) {
    const ref = useRef<SVGSVGElement>(null);

    useGSAP(
        () => {
            if (!ref.current) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                gsap.set(ref.current.querySelectorAll('[data-draw]'), { strokeDashoffset: 0, opacity: 1 });
                return;
            }

            const lines = ref.current.querySelectorAll<SVGElement>('[data-draw]');
            gsap.fromTo(
                lines,
                { strokeDashoffset: 1 },
                {
                    strokeDashoffset: 0,
                    duration: 1.0,
                    ease: 'power2.inOut',
                    stagger: 0.07,
                    delay: 0.8,
                },
            );
        },
        { scope: ref },
    );

    return (
        <svg
            ref={ref}
            viewBox="0 0 48 30"
            fill="none"
            aria-hidden
            className={className}
        >
            <rect data-draw x="1" y="1" width="46" height="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1" pathLength="1" />
            <line data-draw x1="1" y1="9" x2="47" y2="9" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="1" pathLength="1" />
            <line data-draw x1="1" y1="21" x2="47" y2="21" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="1" pathLength="1" />
            <line data-draw x1="24" y1="1" x2="24" y2="29" stroke="#f37021" strokeWidth="1.2" strokeDasharray="1" pathLength="1" />
        </svg>
    );
}
