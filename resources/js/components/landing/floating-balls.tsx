/**
 * FloatingBalls — ambient hermes + chocolate orbs that drift slowly in the hero.
 *
 * Six radial-gradient circles at strategic positions, each on an independent
 * GSAP sine.inOut yoyo tween so movement is organic and never repeating the
 * same path at the same time. Respects prefers-reduced-motion.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

type Orb = {
    left: string;
    top: string;
    size: number;
    opacity: number;
    delay: number;
    duration: number;
    dx: number;
    dy: number;
    isOrange: boolean;
};

const ORBS: Orb[] = [
    { left: '7%',  top: '14%', size: 240, opacity: 0.06,  delay: 0,   duration: 9,  dx: 18,  dy: -14, isOrange: true  },
    { left: '78%', top: '7%',  size: 135, opacity: 0.04,  delay: 1.4, duration: 12, dx: -12, dy: 18,  isOrange: false },
    { left: '91%', top: '55%', size: 95,  opacity: 0.05,  delay: 0.7, duration: 14, dx: -18, dy: -12, isOrange: true  },
    { left: '1%',  top: '72%', size: 70,  opacity: 0.036, delay: 2.3, duration: 8,  dx: 14,  dy: 14,  isOrange: false },
    { left: '45%', top: '90%', size: 170, opacity: 0.03,  delay: 1.1, duration: 16, dx: -10, dy: -20, isOrange: true  },
    { left: '30%', top: '3%',  size: 85,  opacity: 0.046, delay: 1.9, duration: 11, dx: 20,  dy: 10,  isOrange: false },
];

export function FloatingBalls() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const balls = containerRef.current?.querySelectorAll<HTMLElement>('.float-orb');
            if (!balls || balls.length === 0) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                balls.forEach((ball, i) => {
                    const o = ORBS[i];
                    gsap.to(ball, {
                        x: o.dx,
                        y: o.dy,
                        duration: o.duration,
                        delay: o.delay,
                        ease: 'sine.inOut',
                        repeat: -1,
                        yoyo: true,
                    });
                });

                return () => mm.revert();
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
            {ORBS.map((orb, i) => (
                <div
                    key={i}
                    className="float-orb absolute rounded-full"
                    style={{
                        left: orb.left,
                        top: orb.top,
                        width: orb.size,
                        height: orb.size,
                        background: orb.isOrange
                            ? 'radial-gradient(circle at 38% 32%, rgba(243,112,33,1) 0%, rgba(243,112,33,0.3) 45%, transparent 70%)'
                            : 'radial-gradient(circle at 38% 32%, rgba(62,40,23,0.8) 0%, rgba(62,40,23,0.18) 45%, transparent 70%)',
                        opacity: orb.opacity,
                        transform: 'translate(-50%, -50%)',
                        willChange: 'transform',
                    }}
                />
            ))}
        </div>
    );
}
