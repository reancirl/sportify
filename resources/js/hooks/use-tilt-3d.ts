import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Tilt3DOptions = {
    /** Max rotateX degrees (front edge tips toward viewer). Default 7. */
    intensityX?: number;
    /** Max rotateY degrees. Default 10. */
    intensityY?: number;
    /** Scale on hover. Default 1 (no scale). */
    hoverScale?: number;
    /** Tween duration on mouse move. Default 0.45s. */
    duration?: number;
    /** Spring-back duration. Default 1.2s. */
    resetDuration?: number;
    /** Spring-back easing. Default elastic.out. */
    resetEase?: string;
};

/**
 * Attaches GPU-accelerated 3D perspective tilt + elastic spring reset
 * to the returned ref element via GSAP.
 *
 * Requirements:
 *  - The parent container should have `perspective` set for the effect to be
 *    visible (e.g. `style={{ perspective: '1000px' }}`).
 *  - Set `transformStyle: 'preserve-3d'` on the element itself when inner
 *    children need Z-depth layering via `translateZ`.
 */
export function useTilt3D<T extends HTMLElement>(
    options: Tilt3DOptions = {},
): RefObject<T | null> {
    const {
        intensityX = 7,
        intensityY = 10,
        hoverScale = 1,
        duration = 0.45,
        resetDuration = 1.2,
        resetEase = 'elastic.out(1, 0.4)',
    } = options;

    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const rX = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -intensityX;
            const rY = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * intensityY;
            gsap.to(el, {
                rotateX: rX,
                rotateY: rY,
                scale: hoverScale,
                duration,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        };

        const onLeave = () => {
            gsap.to(el, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: resetDuration,
                ease: resetEase,
                overwrite: 'auto',
            });
        };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);

        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, [intensityX, intensityY, hoverScale, duration, resetDuration, resetEase]);

    return ref;
}
