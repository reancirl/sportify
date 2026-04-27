/**
 * MagneticLink — wraps an Inertia <Link> with a subtle magnetic cursor effect.
 *
 * On mousemove within the bounding rect the inner content translates by up to
 * `strength` pixels (default 6) toward the cursor. Resets on mouseleave with
 * a spring-like GSAP tween.
 *
 * Honors prefers-reduced-motion: passes through as a plain Link with no effect.
 * Preserves all Link props including `prefetch`.
 */
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { useRef, useCallback } from 'react';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link> & {
    /** Max pixel translation from center. Default 6. */
    strength?: number;
};

export function MagneticLink({ children, strength = 6, ...linkProps }: Props) {
    const innerRef = useRef<HTMLSpanElement>(null);

    const reduce = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (reduce || !innerRef.current) {
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = ((e.clientX - cx) / (rect.width / 2)) * strength;
            const dy = ((e.clientY - cy) / (rect.height / 2)) * strength;

            gsap.to(innerRef.current, {
                x: dx,
                y: dy,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: true,
            });
        },
        [reduce, strength],
    );

    const handleMouseLeave = useCallback(() => {
        if (reduce || !innerRef.current) {
            return;
        }

        gsap.to(innerRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
            overwrite: true,
        });
    }, [reduce]);

    return (
        <Link
            {...linkProps}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <span ref={innerRef} className="inline-flex items-center gap-2">
                {children}
            </span>
        </Link>
    );
}
