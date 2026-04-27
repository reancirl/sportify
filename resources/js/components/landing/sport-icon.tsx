import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useId, useRef } from 'react';

gsap.registerPlugin(MotionPathPlugin);

/* ── Tennis racquet ───────────────────────────────────────────────────── */
function TennisIcon({ className }: { className?: string }) {
    const ref = useRef<SVGSVGElement>(null);
    // Unique id so the clipPath doesn't collide if ever rendered twice
    const rawId = useId();
    const clipId = rawId.replace(/:/g, '-');

    useGSAP(
        () => {
            if (!ref.current) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            // Ball orbits AROUND the outside of the racket head (never through it).
            // Relative offsets from starting position (40, 6) — top of orbit.
            // Orbit ellipse: centre (40,34), rx≈28, ry≈30 — larger than the frame.
            gsap.to(ref.current.querySelector('[data-ball]'), {
                motionPath: {
                    path: [
                        { x: 20,  y: 9  },  // top-right
                        { x: 28,  y: 30 },  // right
                        { x: 20,  y: 52 },  // bottom-right
                        { x: 0,   y: 60 },  // bottom
                        { x: -20, y: 52 },  // bottom-left
                        { x: -28, y: 30 },  // left
                        { x: -20, y: 9  },  // top-left
                        { x: 0,   y: 0  },  // back to top
                    ],
                },
                duration: 3.2,
                ease: 'none',
                repeat: -1,
            });

            // Gentle racket sway
            gsap.to(ref.current, {
                rotate: 4,
                duration: 2.4,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                transformOrigin: '50% 50%',
            });
        },
        { scope: ref },
    );

    return (
        <svg
            ref={ref}
            viewBox="0 0 80 92"
            fill="none"
            aria-hidden
            className={className}
            style={{ overflow: 'visible' }}
        >
            <defs>
                {/* clip strings to exactly the inside of the frame */}
                <clipPath id={clipId}>
                    <ellipse cx="40" cy="34" rx="21" ry="25" />
                </clipPath>
            </defs>

            {/* Racket head frame */}
            <ellipse cx="40" cy="34" rx="22" ry="26" stroke="currentColor" strokeWidth="2.5" />

            {/* String grid — clipped so no string bleeds outside the frame */}
            <g clipPath={`url(#${clipId})`} stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.5">
                <line x1="27" y1="8"  x2="27" y2="60" />
                <line x1="32" y1="8"  x2="32" y2="60" />
                <line x1="36" y1="8"  x2="36" y2="60" />
                <line x1="40" y1="8"  x2="40" y2="60" />
                <line x1="44" y1="8"  x2="44" y2="60" />
                <line x1="48" y1="8"  x2="48" y2="60" />
                <line x1="53" y1="8"  x2="53" y2="60" />
                <line x1="18" y1="18" x2="62" y2="18" />
                <line x1="18" y1="24" x2="62" y2="24" />
                <line x1="18" y1="30" x2="62" y2="30" />
                <line x1="18" y1="34" x2="62" y2="34" />
                <line x1="18" y1="38" x2="62" y2="38" />
                <line x1="18" y1="44" x2="62" y2="44" />
                <line x1="18" y1="50" x2="62" y2="50" />
            </g>

            {/* Handle throat */}
            <path
                d="M 33,58 L 36,68 L 44,68 L 47,58"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                fill="currentColor" fillOpacity="0.08"
            />
            {/* Grip */}
            <rect x="35" y="68" width="10" height="18" rx="3"
                stroke="currentColor" strokeWidth="2"
                fill="currentColor" fillOpacity="0.1"
            />
            {/* Grip tape wrap */}
            <line x1="35" y1="75" x2="45" y2="75" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />

            {/* Ball — starts at top of orbit, goes AROUND the head */}
            <circle data-ball cx="40" cy="6" r="5" fill="#f37021" />
        </svg>
    );
}

/* ── Pickleball paddle ────────────────────────────────────────────────── */
function PickleballIcon({ className }: { className?: string }) {
    const ref = useRef<SVGSVGElement>(null);

    useGSAP(
        () => {
            if (!ref.current) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            // ball bounce
            const ball = ref.current.querySelector('[data-ball]');
            gsap.to(ball, {
                y: -18,
                duration: 0.55,
                ease: 'power2.out',
                yoyo: true,
                repeat: -1,
            });
            // shadow scale
            const shadow = ref.current.querySelector('[data-shadow]');
            gsap.to(shadow, {
                scaleX: 0.5,
                opacity: 0.2,
                duration: 0.55,
                ease: 'power2.out',
                yoyo: true,
                repeat: -1,
                transformOrigin: '50% 50%',
            });
            // gentle tilt
            gsap.to(ref.current, {
                rotate: -6,
                duration: 2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                transformOrigin: '40px 58px',
            });
        },
        { scope: ref },
    );

    return (
        <svg
            ref={ref}
            viewBox="0 0 80 90"
            fill="none"
            aria-hidden
            className={className}
        >
            {/* paddle body */}
            <rect x="10" y="10" width="60" height="56" rx="28" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2.5" />
            {/* perforations — 3×3 grid */}
            {[22, 40, 58].map((cx) =>
                [24, 36, 48].map((cy) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="currentColor" fillOpacity="0.18" />
                )),
            )}
            {/* handle */}
            <rect x="32" y="65" width="16" height="20" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="66" x2="40" y2="84" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
            {/* wiffle ball */}
            <g data-ball>
                <circle cx="62" cy="18" r="9" fill="#f37021" />
                <path d="M 56,14 Q 62,10 68,14" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <path d="M 54,20 Q 62,24 70,20" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
            {/* shadow */}
            <ellipse data-shadow cx="62" cy="30" rx="8" ry="3" fill="currentColor" fillOpacity="0.12" />
        </svg>
    );
}

/* ── Badminton shuttlecock ────────────────────────────────────────────── */
function BadmintonIcon({ className }: { className?: string }) {
    const ref = useRef<SVGSVGElement>(null);

    useGSAP(
        () => {
            if (!ref.current) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            gsap.to(ref.current, {
                rotate: 8,
                y: -4,
                duration: 1.8,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                transformOrigin: '40px 70px',
            });
        },
        { scope: ref },
    );

    return (
        <svg
            ref={ref}
            viewBox="0 0 80 90"
            fill="none"
            aria-hidden
            className={className}
        >
            {/* feather ring */}
            <ellipse cx="40" cy="22" rx="24" ry="7" stroke="#f37021" strokeWidth="2" fill="#f37021" fillOpacity="0.12" />
            {/* outer cone — left edge */}
            <path d="M 16,22 Q 20,46 28,60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* outer cone — right edge */}
            <path d="M 64,22 Q 60,46 52,60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* feather shafts */}
            <line x1="24" y1="22" x2="31" y2="60" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="32" y1="17" x2="35" y2="60" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="40" y1="15" x2="40" y2="60" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="48" y1="17" x2="45" y2="60" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.55" />
            <line x1="56" y1="22" x2="49" y2="60" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.55" />
            {/* cork dome */}
            <path d="M 28,60 Q 28,52 40,52 Q 52,52 52,60 Q 52,70 40,72 Q 28,70 28,60 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
            {/* cork highlight */}
            <ellipse cx="40" cy="58" rx="6" ry="3" fill="currentColor" fillOpacity="0.2" />
        </svg>
    );
}

/* ── Exports ─────────────────────────────────────────────────────────── */

const icons = {
    Tennis: TennisIcon,
    Pickleball: PickleballIcon,
    Badminton: BadmintonIcon,
} as const;

export type SportName = keyof typeof icons;

export function SportIcon({
    sport,
    className,
}: {
    sport: SportName;
    className?: string;
}) {
    const Icon = icons[sport];
    return <Icon className={className} />;
}
