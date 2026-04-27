import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function AnimatedStat({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isNumeric = /^\d+$/.test(value);

    useGSAP(
        () => {
            if (!ref.current || !isNumeric) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const el = ref.current.querySelector<HTMLElement>('[data-number]');
            if (!el) return;

            const target = parseInt(value, 10);
            const obj = { n: 0 };

            gsap.to(obj, {
                n: target,
                duration: 1.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: ref.current,
                    start: 'top 85%',
                    once: true,
                },
                onUpdate() {
                    el.textContent = Math.round(obj.n).toString();
                },
            });
        },
        { scope: ref },
    );

    return (
        <div ref={ref}>
            <p
                data-number
                className="font-display text-3xl font-bold leading-none tracking-[-0.02em] text-[#3e2817] sm:text-4xl"
            >
                {value}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#5c3a21]">
                {label}
            </p>
        </div>
    );
}
