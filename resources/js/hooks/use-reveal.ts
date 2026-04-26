import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { RefObject } from 'react';

type RevealOptions = {
    /** Selector inside the container to stagger over. Defaults to `[data-reveal]`. */
    selector?: string;
    /** Vertical offset to slide from. Defaults to 24px. */
    y?: number;
    /** Horizontal offset to slide from. Defaults to 0. */
    x?: number;
    /** Per-element duration. Defaults to 0.9. */
    duration?: number;
    /** Stagger between children. Defaults to 0.07. */
    stagger?: number;
    /** Delay before the timeline starts. Defaults to 0.05. */
    delay?: number;
    /**
     * If false, animation runs immediately on mount.
     * If true (default), wait until the container scrolls into view.
     */
    scroll?: boolean;
    /** ScrollTrigger start position. Defaults to "top 85%". */
    start?: string;
    /** Easing — defaults to a soft luxury cubic. */
    ease?: string;
};

/**
 * Editorial reveal — fade + soft slide on a stagger.
 *
 * Mark children with `data-reveal` (or pass a custom `selector`).
 * Honors `prefers-reduced-motion` by snapping elements straight to their
 * resting state.
 */
export function useReveal<T extends HTMLElement>(
    options: RevealOptions = {},
): RefObject<T | null> {
    const {
        selector = '[data-reveal]',
        y = 24,
        x = 0,
        duration = 0.9,
        stagger = 0.07,
        delay = 0.05,
        scroll = true,
        start = 'top 85%',
        ease = 'power3.out',
    } = options;

    const ref = useRef<T>(null);

    useGSAP(
        () => {
            if (!ref.current) {
                return;
            }

            const targets = ref.current.querySelectorAll<HTMLElement>(selector);

            if (targets.length === 0) {
                return;
            }

            const reduce = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            if (reduce) {
                gsap.set(targets, { opacity: 1, x: 0, y: 0 });

                return;
            }

            const tween = gsap.fromTo(
                targets,
                { opacity: 0, y, x },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration,
                    delay: scroll ? 0 : delay,
                    stagger,
                    ease,
                    ...(scroll && {
                        scrollTrigger: {
                            trigger: ref.current,
                            start,
                            toggleActions: 'play none none none',
                            once: true,
                        },
                    }),
                },
            );

            return () => {
                tween.scrollTrigger?.kill();
                tween.kill();
            };
        },
        { scope: ref },
    );

    return ref;
}
