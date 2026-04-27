import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type LoaderState = 'idle' | 'loading' | 'finishing';

/**
 * A full-screen branded page-load loader.
 *
 * - Thin hermes-orange progress bar across the top, always visible during navigation.
 * - Court overlay (SVG + ball animation) appears only for slow loads (>250 ms).
 * - Respects `prefers-reduced-motion`: skips ball animation, shows bar only.
 * - Fades out on `finish` or `error`.
 */
export function PageLoader() {
    const [state, setState] = useState<LoaderState>('idle');
    const [progress, setProgress] = useState(0);
    const [showCourt, setShowCourt] = useState(false);

    const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduceMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const clearSlow = () => {
            if (slowTimer.current) {
                clearTimeout(slowTimer.current);
                slowTimer.current = null;
            }
        };

        const clearReset = () => {
            if (resetTimer.current) {
                clearTimeout(resetTimer.current);
                resetTimer.current = null;
            }
        };

        const off1 = router.on('start', () => {
            clearSlow();
            clearReset();
            setState('loading');
            setProgress(15);
            setShowCourt(false);
            slowTimer.current = setTimeout(() => setShowCourt(true), 250);
        });

        const off2 = router.on('progress', (event) => {
            if (event.detail.progress?.percentage != null) {
                setProgress(Math.max(15, event.detail.progress.percentage));
            }
        });

        const finish = () => {
            clearSlow();
            clearReset();
            setProgress(100);
            setState('finishing');
            resetTimer.current = setTimeout(() => {
                setState('idle');
                setProgress(0);
                setShowCourt(false);
                resetTimer.current = null;
            }, 400);
        };

        const off3 = router.on('finish', finish);
        const off4 = router.on('error', finish);

        return () => {
            off1();
            off2();
            off3();
            off4();
            clearSlow();
            clearReset();
        };
    }, []);

    const visible = state === 'loading' || state === 'finishing';

    if (!visible) {
        return null;
    }

    return (
        <>
            {/* Progress bar */}
            <div
                role="progressbar"
                aria-label="Page loading"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="pointer-events-none fixed top-0 left-0 z-[9999] h-[2.5px] bg-hermes transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, opacity: state === 'finishing' ? 0 : 1 }}
            />

            {/* Court overlay — only on slow loads */}
            {showCourt && !reduceMotion && (
                <div
                    aria-hidden
                    className={cn(
                        'pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center',
                        'bg-cream/80 backdrop-blur-[2px]',
                        'transition-opacity duration-300',
                        state === 'finishing' ? 'opacity-0' : 'opacity-100',
                    )}
                >
                    <CourtMotif />
                </div>
            )}
        </>
    );
}

/* ── Court SVG motif ─────────────────────────────────────────────────── */

/**
 * Minimal line-art pickleball court with an animated ball travelling
 * back and forth across the net. Matches the BackdropOrnament aesthetic:
 * chocolate strokes, hermes accents, cream surface.
 */
function CourtMotif() {
    return (
        <div className="flex flex-col items-center gap-4">
            <svg
                viewBox="0 0 120 80"
                width="120"
                height="80"
                fill="none"
                aria-hidden
                className="overflow-visible"
            >
                <style>{`
                    @keyframes ball-travel {
                        0%   { transform: translateX(0px)   translateY(0px); }
                        45%  { transform: translateX(68px)  translateY(-8px); }
                        50%  { transform: translateX(72px)  translateY(0px); }
                        95%  { transform: translateX(4px)   translateY(-8px); }
                        100% { transform: translateX(0px)   translateY(0px); }
                    }
                    .sp-ball {
                        animation: ball-travel 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                        transform-box: fill-box;
                        transform-origin: center;
                    }
                `}</style>

                {/* Court outline */}
                <rect
                    x="4"
                    y="8"
                    width="112"
                    height="64"
                    stroke="#3e2817"
                    strokeWidth="0.8"
                />

                {/* Net (centre line) */}
                <line
                    x1="60"
                    y1="8"
                    x2="60"
                    y2="72"
                    stroke="#3e2817"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                />

                {/* Kitchen / NVZ lines */}
                <line
                    x1="4"
                    y1="29"
                    x2="60"
                    y2="29"
                    stroke="#3e2817"
                    strokeWidth="0.5"
                    strokeDasharray="1.5 2"
                />
                <line
                    x1="60"
                    y1="29"
                    x2="116"
                    y2="29"
                    stroke="#3e2817"
                    strokeWidth="0.5"
                    strokeDasharray="1.5 2"
                />
                <line
                    x1="4"
                    y1="51"
                    x2="60"
                    y2="51"
                    stroke="#3e2817"
                    strokeWidth="0.5"
                    strokeDasharray="1.5 2"
                />
                <line
                    x1="60"
                    y1="51"
                    x2="116"
                    y2="51"
                    stroke="#3e2817"
                    strokeWidth="0.5"
                    strokeDasharray="1.5 2"
                />

                {/* Net post */}
                <line
                    x1="60"
                    y1="8"
                    x2="60"
                    y2="72"
                    stroke="#f37021"
                    strokeWidth="1.2"
                />

                {/* Ball — starts left side, centre height */}
                <circle
                    cx="20"
                    cy="40"
                    r="4"
                    fill="#f37021"
                    stroke="#d85a14"
                    strokeWidth="0.6"
                    className="sp-ball"
                />
            </svg>

            {/* Wordmark-style loading label */}
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-chocolate/50">
                Loading
            </p>
        </div>
    );
}
