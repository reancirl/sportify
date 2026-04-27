/**
 * ParticleField — constellation dot grid for the dark membership section.
 *
 * Renders an 8×6 grid of 2px circles. Each dot gets a randomised GSAP
 * opacity pulse so the field feels alive without being distracting.
 * Respects prefers-reduced-motion: fully visible, static.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

type Props = {
    cols?: number;
    rows?: number;
    className?: string;
};

export function ParticleField({ cols = 10, rows = 7, className }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const dots = containerRef.current?.querySelectorAll<HTMLElement>('.particle-dot');
            if (!dots || dots.length === 0) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                dots.forEach((dot) => {
                    gsap.to(dot, {
                        opacity: gsap.utils.random(0.04, 0.22),
                        duration: gsap.utils.random(2.5, 6),
                        delay: gsap.utils.random(0, 4),
                        ease: 'sine.inOut',
                        repeat: -1,
                        yoyo: true,
                    });
                });

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set(dots, { opacity: 0.08 });
                return () => mm.revert();
            });
        },
        { scope: containerRef },
    );

    const total = cols * rows;

    return (
        <div
            ref={containerRef}
            aria-hidden
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '0',
                alignItems: 'center',
                justifyItems: 'center',
            }}
        >
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className="particle-dot rounded-full bg-cream"
                    style={{
                        width: 2,
                        height: 2,
                        opacity: 0.08,
                        willChange: 'opacity',
                    }}
                />
            ))}
        </div>
    );
}
