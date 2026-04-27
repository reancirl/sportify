import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

type Orb = {
    size: number;
    top: string;
    left: string;
    color: string;
    duration: number;
    delay: number;
    yRange: number;
    xRange: number;
};

const orbs: Orb[] = [
    { size: 320, top: '-8%', left: '62%', color: 'rgba(243,112,33,0.07)', duration: 14, delay: 0, yRange: 24, xRange: 12 },
    { size: 180, top: '30%', left: '78%', color: 'rgba(62,40,23,0.06)', duration: 10, delay: 2, yRange: 18, xRange: 8 },
    { size: 240, top: '55%', left: '55%', color: 'rgba(243,112,33,0.05)', duration: 16, delay: 1, yRange: 30, xRange: 15 },
    { size: 120, top: '10%', left: '88%', color: 'rgba(92,58,33,0.08)', duration: 9, delay: 3, yRange: 14, xRange: 6 },
    { size: 200, top: '-5%', left: '40%', color: 'rgba(243,112,33,0.04)', duration: 12, delay: 0.5, yRange: 20, xRange: 10 },
];

export function FloatingOrbs() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const orbEls = containerRef.current.querySelectorAll<HTMLElement>('[data-orb]');
            orbEls.forEach((el, i) => {
                const orb = orbs[i];
                gsap.to(el, {
                    y: orb.yRange,
                    x: orb.xRange,
                    duration: orb.duration,
                    delay: orb.delay,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                });
            });
        },
        { scope: containerRef },
    );

    return (
        <div
            ref={containerRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {orbs.map((orb, i) => (
                <div
                    key={i}
                    data-orb
                    style={{
                        position: 'absolute',
                        width: orb.size,
                        height: orb.size,
                        top: orb.top,
                        left: orb.left,
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, ${orb.color}, transparent 70%)`,
                        filter: 'blur(1px)',
                    }}
                />
            ))}
        </div>
    );
}
