import Lottie from 'lottie-react';

/* ── Lottie JSON data — inline, no external fetch ────────────────────── */

const pulseRingData = {
    v: '5.9.4',
    fr: 30,
    ip: 0,
    op: 75,
    w: 120,
    h: 120,
    nm: 'pulse-ring',
    ddd: 0,
    assets: [],
    layers: [
        {
            ddd: 0,
            ind: 1,
            ty: 4,
            nm: 'Ring 1',
            sr: 1,
            ks: {
                o: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [70] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 50, s: [0] },
                        { t: 75, s: [0] },
                    ],
                },
                r: { a: 0, k: 0 },
                p: { a: 0, k: [60, 60, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        { i: { x: [0.42, 0.42], y: [1, 1] }, o: { x: [0.58, 0.58], y: [0, 0] }, t: 0, s: [15, 15, 100] },
                        { t: 60, s: [100, 100, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [80, 80] }, nm: 'el' },
                {
                    ty: 'st',
                    c: { a: 0, k: [0.953, 0.439, 0.129, 1] },
                    o: { a: 0, k: 100 },
                    w: { a: 0, k: 2.5 },
                    lc: 2,
                    lj: 2,
                    nm: 'st',
                },
                { ty: 'fl', c: { a: 0, k: [0, 0, 0, 0] }, o: { a: 0, k: 0 }, nm: 'fl' },
            ],
            ip: 0,
            op: 75,
            st: 0,
        },
        {
            ddd: 0,
            ind: 2,
            ty: 4,
            nm: 'Ring 2',
            sr: 1,
            ks: {
                o: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 18, s: [70] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 68, s: [0] },
                        { t: 75, s: [0] },
                    ],
                },
                r: { a: 0, k: 0 },
                p: { a: 0, k: [60, 60, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        { i: { x: [0.42, 0.42], y: [1, 1] }, o: { x: [0.58, 0.58], y: [0, 0] }, t: 18, s: [15, 15, 100] },
                        { t: 75, s: [100, 100, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [80, 80] }, nm: 'el' },
                {
                    ty: 'st',
                    c: { a: 0, k: [0.953, 0.439, 0.129, 1] },
                    o: { a: 0, k: 100 },
                    w: { a: 0, k: 2.5 },
                    lc: 2,
                    lj: 2,
                    nm: 'st',
                },
                { ty: 'fl', c: { a: 0, k: [0, 0, 0, 0] }, o: { a: 0, k: 0 }, nm: 'fl' },
            ],
            ip: 18,
            op: 75,
            st: 18,
        },
        {
            ddd: 0,
            ind: 3,
            ty: 4,
            nm: 'Dot',
            sr: 1,
            ks: {
                o: { a: 0, k: 100 },
                r: { a: 0, k: 0 },
                p: { a: 0, k: [60, 60, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        { i: { x: [0.4, 0.4], y: [1, 1] }, o: { x: [0.6, 0.6], y: [0, 0] }, t: 0, s: [80, 80, 100] },
                        { i: { x: [0.4, 0.4], y: [1, 1] }, o: { x: [0.6, 0.6], y: [0, 0] }, t: 37, s: [110, 110, 100] },
                        { t: 75, s: [80, 80, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [22, 22] }, nm: 'el' },
                { ty: 'fl', c: { a: 0, k: [0.953, 0.439, 0.129, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 0,
            op: 75,
            st: 0,
        },
    ],
};

const bounceBallData = {
    v: '5.9.4',
    fr: 30,
    ip: 0,
    op: 60,
    w: 60,
    h: 110,
    nm: 'bounce-ball',
    ddd: 0,
    assets: [],
    layers: [
        {
            ddd: 0,
            ind: 1,
            ty: 4,
            nm: 'Ball',
            sr: 1,
            ks: {
                o: { a: 0, k: 100 },
                r: { a: 0, k: 0 },
                p: {
                    a: 1,
                    k: [
                        { i: { x: 0.42, y: 1 }, o: { x: 0.58, y: 0 }, t: 0, s: [30, 14, 0] },
                        { i: { x: 0.42, y: 1 }, o: { x: 0.58, y: 0 }, t: 28, s: [30, 88, 0] },
                        { t: 60, s: [30, 14, 0] },
                    ],
                },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 0,
                            s: [100, 100, 100],
                        },
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 28,
                            s: [120, 85, 100],
                        },
                        { t: 60, s: [100, 100, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [24, 24] }, nm: 'el' },
                { ty: 'fl', c: { a: 0, k: [0.953, 0.439, 0.129, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 0,
            op: 60,
            st: 0,
        },
        {
            ddd: 0,
            ind: 2,
            ty: 4,
            nm: 'Shadow',
            sr: 1,
            ks: {
                o: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [60] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 28, s: [25] },
                        { t: 60, s: [60] },
                    ],
                },
                r: { a: 0, k: 0 },
                p: { a: 0, k: [30, 100, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 0,
                            s: [100, 100, 100],
                        },
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 28,
                            s: [55, 100, 100],
                        },
                        { t: 60, s: [100, 100, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [20, 6] }, nm: 'el' },
                { ty: 'fl', c: { a: 0, k: [0.243, 0.157, 0.09, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 0,
            op: 60,
            st: 0,
        },
    ],
};

const trophySparkData = {
    v: '5.9.4',
    fr: 30,
    ip: 0,
    op: 90,
    w: 100,
    h: 100,
    nm: 'trophy-spark',
    ddd: 0,
    assets: [],
    layers: [
        {
            ddd: 0,
            ind: 1,
            ty: 4,
            nm: 'Trophy',
            sr: 1,
            ks: {
                o: { a: 0, k: 100 },
                r: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [-4] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 45, s: [4] },
                        { t: 90, s: [-4] },
                    ],
                },
                p: { a: 0, k: [50, 50, 0] },
                a: { a: 0, k: [0, 0, 0] },
                s: {
                    a: 1,
                    k: [
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 0,
                            s: [95, 95, 100],
                        },
                        {
                            i: { x: [0.42, 0.42], y: [1, 1] },
                            o: { x: [0.58, 0.58], y: [0, 0] },
                            t: 45,
                            s: [105, 105, 100],
                        },
                        { t: 90, s: [95, 95, 100] },
                    ],
                },
            },
            ao: 0,
            shapes: [
                {
                    ty: 'rc',
                    p: { a: 0, k: [0, -8] },
                    s: { a: 0, k: [28, 24] },
                    r: { a: 0, k: 3 },
                    nm: 'cup',
                },
                {
                    ty: 'rc',
                    p: { a: 0, k: [0, 8] },
                    s: { a: 0, k: [8, 12] },
                    r: { a: 0, k: 2 },
                    nm: 'stem',
                },
                {
                    ty: 'rc',
                    p: { a: 0, k: [0, 15] },
                    s: { a: 0, k: [22, 4] },
                    r: { a: 0, k: 1 },
                    nm: 'base',
                },
                { ty: 'fl', c: { a: 0, k: [0.953, 0.439, 0.129, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 0,
            op: 90,
            st: 0,
        },
        {
            ddd: 0,
            ind: 2,
            ty: 4,
            nm: 'Spark L',
            sr: 1,
            ks: {
                o: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 20, s: [90] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 50, s: [0] },
                        { t: 90, s: [0] },
                    ],
                },
                r: { a: 0, k: 0 },
                p: {
                    a: 1,
                    k: [
                        { i: { x: 0.42, y: 1 }, o: { x: 0.58, y: 0 }, t: 0, s: [28, 32, 0] },
                        { t: 50, s: [18, 20, 0] },
                    ],
                },
                a: { a: 0, k: [0, 0, 0] },
                s: { a: 0, k: [100, 100, 100] },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [6, 6] }, nm: 'el' },
                { ty: 'fl', c: { a: 0, k: [0.953, 0.439, 0.129, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 0,
            op: 90,
            st: 0,
        },
        {
            ddd: 0,
            ind: 3,
            ty: 4,
            nm: 'Spark R',
            sr: 1,
            ks: {
                o: {
                    a: 1,
                    k: [
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 10, s: [0] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 30, s: [90] },
                        { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [0] },
                        { t: 90, s: [0] },
                    ],
                },
                r: { a: 0, k: 0 },
                p: {
                    a: 1,
                    k: [
                        { i: { x: 0.42, y: 1 }, o: { x: 0.58, y: 0 }, t: 10, s: [72, 32, 0] },
                        { t: 60, s: [82, 20, 0] },
                    ],
                },
                a: { a: 0, k: [0, 0, 0] },
                s: { a: 0, k: [100, 100, 100] },
            },
            ao: 0,
            shapes: [
                { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [6, 6] }, nm: 'el' },
                { ty: 'fl', c: { a: 0, k: [0.953, 0.439, 0.129, 1] }, o: { a: 0, k: 100 }, nm: 'fl' },
            ],
            ip: 10,
            op: 90,
            st: 10,
        },
    ],
};

/* ── Component API ───────────────────────────────────────────────────── */

const variants = {
    pulse: pulseRingData,
    bounce: bounceBallData,
    trophy: trophySparkData,
} as const;

export type LottieVariant = keyof typeof variants;

export function LottieAccent({
    variant,
    className,
    loop = true,
    speed = 1,
}: {
    variant: LottieVariant;
    className?: string;
    loop?: boolean;
    speed?: number;
}) {
    return (
        <Lottie
            animationData={variants[variant]}
            loop={loop}
            className={className}
            style={{ display: 'block' }}
            rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
            // lottie-react exposes speed via the lottieRef — simplest to just rely on json timing
        />
    );
}
