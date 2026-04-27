/**
 * ScoreboardStat — a single stat displayed as a scoreboard panel cell.
 *
 * Visual: massive Geist Black numeral + short uppercase label.
 * The numeral digits animate via rotateX flip (−90 → 0) on mount,
 * creating a flip-scoreboard effect.
 *
 * Usage:
 *   <ScoreboardStat value={42} label="Verified venues" />
 *   <ScoreboardStat value="MNL" label="Metro Manila" />
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
    value: ReactNode;
    label: string;
    /** Optional: trigger the flip animation. Defaults to true. */
    animate?: boolean;
};

export function ScoreboardStat({ value, label, animate = true }: Props) {
    const numeralRef = useRef<HTMLParagraphElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!numeralRef.current || !animate) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // Split text content into individual character spans for digit flip
                const el = numeralRef.current!;
                const originalHTML = el.innerHTML;

                // Wrap each character in a span with perspective
                const text = el.textContent ?? '';
                const chars = text.split('').map((ch) => {
                    const span = document.createElement('span');
                    span.textContent = ch;
                    span.style.display = 'inline-block';
                    return span;
                });

                el.innerHTML = '';
                chars.forEach((span) => el.appendChild(span));

                gsap.set(chars, { perspective: 400 });

                gsap.fromTo(
                    chars,
                    { rotateX: -90, opacity: 0 },
                    {
                        rotateX: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.08,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: wrapRef.current,
                            start: 'top 85%',
                            once: true,
                        },
                        onComplete: () => {
                            // Restore original content after animation
                            // (keeps ReactNode intact if it was a component)
                            if (typeof value === 'string' || typeof value === 'number') {
                                el.innerHTML = originalHTML;
                            }
                        },
                    },
                );

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set(numeralRef.current, { opacity: 1, rotateX: 0 });
                return () => mm.revert();
            });
        },
        { scope: wrapRef },
    );

    return (
        <div
            ref={wrapRef}
            className="flex flex-col border border-chocolate/20 bg-cream px-4 py-5"
        >
            {/* Massive scoreboard numeral */}
            <p
                ref={numeralRef}
                className="font-sans text-[clamp(2.4rem,5vw,4rem)] font-black leading-none tracking-[-0.04em] text-chocolate"
            >
                {value}
            </p>
            {/* Short uppercase label — broadcast lower-third style */}
            <p className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-chocolate-soft">
                {label}
            </p>
        </div>
    );
}
