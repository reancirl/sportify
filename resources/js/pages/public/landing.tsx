import { useGSAP } from '@gsap/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatedStat } from '@/components/landing/animated-stat';
import { FloatingOrbs } from '@/components/landing/floating-orbs';
import { HeroCourt, MiniCourtEmblem } from '@/components/landing/hero-court';
import { SportIcon } from '@/components/landing/sport-icon';
import type { SportName } from '@/components/landing/sport-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VenueCard } from '@/components/venue/venue-card';
import { useReveal } from '@/hooks/use-reveal';
import { useTilt3D } from '@/hooks/use-tilt-3d';
import { dashboard, login, register } from '@/routes';
import type { Models, User } from '@/types';

gsap.registerPlugin(SplitText, ScrollTrigger);

type VenueListing = Models.Venue & {
    courts_count?: number;
    courts_min_hourly_rate?: string | number | null;
};

type Props = {
    venues: Models.PaginatedResponse<VenueListing>;
    cities: string[];
    filters: {
        city: string | null;
        search: string | null;
    };
    canRegister?: boolean;
};

export default function Landing({
    venues,
    cities,
    filters,
    canRegister = true,
}: Props) {
    const { auth } = usePage().props;
    const user = (auth as { user: User | null }).user;

    const [search, setSearch] = useState(filters.search ?? '');
    const [city, setCity] = useState<string>(filters.city ?? 'all');

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/',
            {
                search: search || undefined,
                city: city === 'all' ? undefined : city,
            },
            { preserveState: true, preserveScroll: false, replace: true },
        );
    };

    const heroRef = useRef<HTMLElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const sportsRef = useReveal<HTMLElement>({ stagger: 0.1, y: 32 });
    const venueSectionRef = useRef<HTMLElement>(null);
    const venueStripRef = useRef<HTMLDivElement>(null);
    const membershipRef = useReveal<HTMLElement>({ stagger: 0.09, y: 28 });
    const hostsRef = useReveal<HTMLElement>({ stagger: 0.08, y: 24 });

    /* ── Cursor glow + hero scene horizontal mouse parallax ──────────── */
    useEffect(() => {
        const glow = glowRef.current;
        if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const onMove = (e: MouseEvent) => {
            // Cursor glow blob
            gsap.to(glow, {
                x: e.clientX - 160,
                y: e.clientY - 160,
                duration: 0.9,
                ease: 'power3.out',
                overwrite: 'auto',
            });

            // Hero background layers drift horizontally with the cursor
            // (only active while the cursor is within the hero section)
            const hero = heroRef.current;
            if (hero) {
                const rect = hero.getBoundingClientRect();
                if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    const nx = e.clientX / rect.width - 0.5; // –0.5 → 0.5
                    const bg = hero.querySelector<HTMLElement>('[data-hero-bg]');
                    const orbs = hero.querySelector<HTMLElement>('[data-hero-orbs]');
                    // bg moves slower, orbs faster (parallax depth)
                    if (bg) {
                        gsap.to(bg, { x: nx * 22, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
                    }
                    if (orbs) {
                        gsap.to(orbs, { x: nx * 40, duration: 1.0, ease: 'power3.out', overwrite: 'auto' });
                    }
                }
            }
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    /* ── Hero entrance ──────────────────────────────────────────────── */
    useGSAP(
        () => {
            if (!heroRef.current) return;

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const label = heroRef.current.querySelector('[data-hero-label]');
            const h1 = heroRef.current.querySelector('[data-hero-h1]');
            const body = heroRef.current.querySelector('[data-hero-body]');
            const ctas = heroRef.current.querySelector('[data-hero-ctas]');
            const stats = heroRef.current.querySelectorAll('[data-hero-stat]');
            const card = heroRef.current.querySelector('[data-hero-card]');
            const divider = heroRef.current.querySelector('[data-hero-divider]');

            if (reduced) {
                gsap.set([label, h1, body, ctas, stats, card, divider], { opacity: 1, y: 0, x: 0 });
                return;
            }

            const split = new SplitText(h1, {
                type: 'chars',
                charsClass: 'inline-block',
            });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from(label, { opacity: 0, y: 14, duration: 0.55 }, 0.3)
                .from(
                    split.chars,
                    {
                        // Each character flips in like a page turning in 3D space
                        opacity: 0,
                        rotateX: -80,
                        y: 20,
                        duration: 0.65,
                        stagger: { amount: 0.7, from: 'start' },
                        ease: 'power3.out',
                        transformOrigin: '50% 100%',
                        transformPerspective: 700,
                    },
                    0.5,
                )
                .from(body, { opacity: 0, y: 20, duration: 0.65 }, 1.1)
                .from(ctas, { opacity: 0, y: 14, duration: 0.55 }, 1.2)
                .from(divider, { scaleX: 0, transformOrigin: 'left center', duration: 0.7 }, 1.3)
                .from(stats, { opacity: 0, y: 12, duration: 0.5, stagger: 0.09 }, 1.4)
                .from(card, { opacity: 0, x: 56, duration: 1.2, ease: 'power4.out' }, 0.5);

            return () => split.revert();
        },
        { scope: heroRef },
    );

    /* ── Hero scroll parallax (vertical) ───────────────────────────── */
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const bgLayer = hero.querySelector<HTMLElement>('[data-hero-bg]');
        const orbsLayer = hero.querySelector<HTMLElement>('[data-hero-orbs]');
        const sts: ReturnType<typeof ScrollTrigger.create>[] = [];

        if (bgLayer) {
            const t = gsap.to(bgLayer, {
                y: -90,
                ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 2 },
            });
            if (t.scrollTrigger) sts.push(t.scrollTrigger);
        }
        if (orbsLayer) {
            const t = gsap.to(orbsLayer, {
                y: -45,
                ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.4 },
            });
            if (t.scrollTrigger) sts.push(t.scrollTrigger);
        }

        return () => sts.forEach((st) => st.kill());
    }, []);

    /* ── Membership value props — 3D scrub reveal ───────────────────── */
    useEffect(() => {
        const section = membershipRef.current;
        if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const props = section.querySelectorAll<HTMLElement>('[data-value-prop]');
        if (!props.length) return;

        // Set initial state: invisible, displaced down, rotated forward (like looking at the top of a card)
        gsap.set(props, {
            opacity: 0,
            y: 48,
            rotateX: 26,
            transformOrigin: '50% 0%',
            transformPerspective: 900,
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'center 35%',
                scrub: 1.4,
            },
        });

        // Stagger each prop's reveal along the scroll range
        props.forEach((prop, i) => {
            tl.to(prop, { opacity: 1, y: 0, rotateX: 0, ease: 'power2.out', duration: 1 }, i * 0.55);
        });

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, []);

    /* ── Venue strip — GSAP horizontal scroll (pin + scrub) ─────────── */
    useEffect(() => {
        const section = venueSectionRef.current;
        const strip = venueStripRef.current;
        if (!section || !strip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // How far the strip must travel: its full content width minus the viewport.
        // Uses function form so GSAP re-evaluates on resize (invalidateOnRefresh).
        const getDistance = () => Math.max(0, strip.scrollWidth - window.innerWidth);

        const tween = gsap.to(strip, {
            x: () => -getDistance(),
            ease: 'none', // REQUIRED — keeps 1:1 mapping between scroll px and translate px
            scrollTrigger: {
                trigger: section,
                pin: true,
                start: 'top top',
                end: () => `+=${getDistance()}`,
                scrub: 1.2,
                invalidateOnRefresh: true, // recalculate on window resize
            },
        });

        return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
        };
    }, [venues.data]);

    return (
        <>
            <Head title="A members-club for racquet sports in Iligan City" />

            <div aria-hidden className="grain-overlay" />

            {/* Cursor glow blob */}
            <div
                ref={glowRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-[9997] h-80 w-80 rounded-full bg-[#f37021]/[0.055] blur-[72px]"
                style={{ willChange: 'transform' }}
            />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative overflow-hidden bg-[#faf5ec]">
                {/* Parallax layer 1 — court geometry (slowest) */}
                <div
                    data-hero-bg
                    className="pointer-events-none absolute inset-0"
                    style={{ willChange: 'transform' }}
                >
                    <HeroCourt className="h-full w-full opacity-[0.06]" />
                </div>

                {/* Parallax layer 2 — ambient orbs (faster) */}
                <div
                    data-hero-orbs
                    className="absolute inset-0"
                    style={{ willChange: 'transform' }}
                >
                    <FloatingOrbs />
                </div>

                <div aria-hidden className="pointer-events-none absolute top-0 right-0 h-[3px] w-[40%] bg-[#f37021]" />

                <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-12 px-6 pt-20 pb-24 sm:px-10 sm:pt-24 sm:pb-28 lg:grid-cols-[1fr_480px] lg:gap-16 lg:px-14 lg:pt-28 lg:pb-32 xl:grid-cols-[1fr_520px]">

                    {/* Left: copy */}
                    <div className="space-y-9">
                        <div data-hero-label className="flex items-center gap-3">
                            <span className="block h-px w-8 bg-[#f37021]" />
                            <p className="editorial-label">
                                Iligan City · Tennis · Pickleball · Badminton
                            </p>
                        </div>

                        <h1
                            data-hero-h1
                            className="font-sans text-[clamp(2.8rem,6.2vw,5.6rem)] font-black leading-[0.96] tracking-[-0.04em] text-[#3e2817]"
                        >
                            A members-club<br />
                            for racquet sports<br />
                            in Iligan City<span className="text-[#f37021]">.</span>
                        </h1>

                        <p
                            data-hero-body
                            className="max-w-[50ch] font-sans text-[1.05rem] leading-[1.75] text-[#5c3a21]"
                        >
                            Reserve premium courts at curated venues across Iligan.
                            Discover open play sessions. Meet players who take the
                            game as seriously as you do — without the queue at the
                            front desk.
                        </p>

                        <div data-hero-ctas className="flex flex-wrap items-center gap-5">
                            {user ? (
                                <MagneticLink
                                    href={dashboard().url}
                                    className="group inline-flex items-center gap-2.5 bg-[#3e2817] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#faf5ec] transition-colors hover:bg-[#2a1a0e]"
                                >
                                    Open dashboard
                                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                                </MagneticLink>
                            ) : (
                                <>
                                    {canRegister && (
                                        <MagneticLink
                                            href={register().url}
                                            className="group inline-flex items-center gap-2.5 bg-[#3e2817] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#faf5ec] transition-colors hover:bg-[#2a1a0e]"
                                        >
                                            Become a member
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                                        </MagneticLink>
                                    )}
                                    <Link
                                        href={login().url}
                                        className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#3e2817]/70 transition hover:text-[#f37021]"
                                    >
                                        Members log in
                                        <ArrowRight className="size-3" aria-hidden />
                                    </Link>
                                </>
                            )}
                        </div>

                        <div>
                            <div data-hero-divider className="mb-8 h-px bg-[#3e2817]/12" />
                            <dl className="grid grid-cols-3 gap-6">
                                <div data-hero-stat>
                                    <AnimatedStat
                                        value={venues.total.toString()}
                                        label={venues.total === 1 ? 'Verified venue' : 'Verified venues'}
                                    />
                                </div>
                                <div data-hero-stat>
                                    <AnimatedStat value="Iligan" label="City of Majestic Falls" />
                                </div>
                                <div data-hero-stat>
                                    <AnimatedStat value="3" label="Sports" />
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right: reservation card */}
                    <div data-hero-card>
                        <ReservationCard
                            search={search}
                            city={city}
                            cities={cities}
                            onSearchChange={setSearch}
                            onCityChange={setCity}
                            onSubmit={handleSearch}
                        />
                    </div>
                </div>
            </section>

            {/* ── The Sports ───────────────────────────────────────────────── */}
            <section ref={sportsRef} id="sports" className="border-t border-[#3e2817]/20 bg-[#faf5ec]">
                <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
                    <div data-reveal>
                        <SectionHeading
                            eyebrow="The Sports"
                            title={
                                <>
                                    Three games.{' '}
                                    <span className="italic text-[#f37021]">One club.</span>
                                </>
                            }
                        />
                    </div>

                    {/* perspective on the grid gives sport tiles their shared 3D camera */}
                    <div
                        className="mt-12 grid gap-px overflow-hidden border border-[#3e2817]/25 bg-[#3e2817]/25 sm:grid-cols-3"
                        style={{ perspective: '1000px' }}
                    >
                        <div data-reveal>
                            <SportTile
                                name="Tennis"
                                copy="Hard, clay, and indoor courts maintained to a tournament standard."
                            />
                        </div>
                        <div data-reveal>
                            <SportTile
                                name="Pickleball"
                                copy="The fastest growing racquet sport in the Philippines — open play, every level."
                                featured
                            />
                        </div>
                        <div data-reveal>
                            <SportTile
                                name="Badminton"
                                copy="Climate-controlled halls and high-ceiling courts for serious shuttle work."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Featured Venues — horizontal GSAP scroll strip ───────────── */}
            <section
                ref={venueSectionRef}
                className="border-t border-[#3e2817]/20 bg-[#faf5ec] overflow-hidden flex h-screen flex-col"
            >
                {/* Header stays pinned at top while the card strip scrolls sideways */}
                <div className="mx-auto w-full max-w-[1440px] px-6 pb-6 pt-14 sm:px-10 sm:pt-16 lg:px-14">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <PulseDot />
                            <SectionHeading
                                eyebrow="The Venues · Iligan City"
                                title={
                                    <>
                                        Where members{' '}
                                        <span className="italic text-[#f37021]">play</span>
                                    </>
                                }
                                copy="Scroll to explore — each venue hand-vetted for surface quality, atmosphere, and the welcome you receive at the door."
                            />
                        </div>
                        <Link
                            href="/venues"
                            className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#3e2817] hover:text-[#f37021] sm:inline-flex"
                        >
                            Browse all venues
                            <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>
                </div>

                {venues.data.length === 0 ? (
                    <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 sm:px-10 lg:px-14">
                        <Card className="border-[#3e2817]/15 bg-white">
                            <CardContent className="py-16 text-center font-sans text-[#5c3a21]">
                                No venues match your search yet. Try widening your filters.
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* GSAP translates this strip leftward as the user scrolls down */
                    <div
                        ref={venueStripRef}
                        className="flex min-h-0 flex-1 items-stretch gap-7 pb-10 pl-6 pt-6 sm:pl-10 lg:pl-14"
                        style={{ willChange: 'transform' }}
                    >
                        {venues.data.map((venue) => (
                            <div
                                key={venue.id}
                                className="w-[340px] flex-shrink-0"
                                style={{ perspective: '1200px' }}
                            >
                                <Tilt3D className="h-full">
                                    <VenueCard venue={venue} />
                                </Tilt3D>
                            </div>
                        ))}
                        {/* Right breathing room so last card doesn't sit flush at scroll end */}
                        <div className="w-6 flex-shrink-0 sm:w-10 lg:w-14" aria-hidden />
                    </div>
                )}
            </section>

            {/* ── Membership ───────────────────────────────────────────────── */}
            <section
                ref={membershipRef}
                id="membership"
                className="relative overflow-hidden bg-[#3e2817] text-[#faf5ec]"
            >
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full border border-[#faf5ec]/[0.06]" />
                <div aria-hidden className="pointer-events-none absolute -right-20 top-12 h-56 w-56 rounded-full border border-[#f37021]/10" />
                <div aria-hidden className="pointer-events-none absolute -right-4 top-4 h-4 w-4 rounded-full bg-[#f37021]/20" />

                <div className="relative mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 sm:py-28 lg:px-14">
                    <p data-reveal className="editorial-label text-[#faf5ec]/65">
                        Membership
                    </p>
                    <h2
                        data-reveal
                        className="mt-4 max-w-3xl font-sans text-[clamp(2.2rem,5vw,4rem)] font-black leading-[1.05] tracking-[-0.04em]"
                    >
                        Booking, refined to its{' '}
                        <span className="italic text-[#f37021]">essential</span>{' '}
                        gestures.
                    </h2>

                    {/* data-value-prop — animated by the 3D scrub useEffect above */}
                    <div className="mt-16 grid gap-12 md:grid-cols-3">
                        <div data-value-prop>
                            <ValueProp
                                number="01"
                                title="Curated venues"
                                copy="Every venue is reviewed before going live. Surface, lighting, amenities — all judged before approval."
                            />
                        </div>
                        <div data-value-prop>
                            <ValueProp
                                number="02"
                                title="One-hour reservations"
                                copy="Choose a court. Choose a time. Confirm. The most luxurious thing we offer is the absence of friction."
                                showBounce
                            />
                        </div>
                        <div data-value-prop>
                            <ValueProp
                                number="03"
                                title="Open play, well-matched"
                                copy="Drop into sessions sized to your level — meet players who play the way you do, in the city you live in."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── For Hosts ─────────────────────────────────────────────────── */}
            <section ref={hostsRef} id="hosts" className="bg-[#faf5ec]">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-14">
                    <div data-reveal className="space-y-6">
                        <p className="editorial-label">For Hosts</p>
                        <h2 className="font-sans text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#3e2817]">
                            Run a venue worth{' '}
                            <span className="italic text-[#f37021]">discovering</span>?
                        </h2>
                        <p className="max-w-xl font-sans text-lg leading-relaxed text-[#5c3a21]">
                            List your courts on sportify
                            <span className="italic text-[#f37021]">.ph</span> and
                            connect with members who value your craft. We handle the
                            bookings; you do what you do best.
                        </p>
                    </div>

                    <div
                        data-reveal
                        className="flex flex-col items-start justify-center gap-4 lg:items-end"
                    >
                        {user ? (
                            <MagneticLink
                                href="/venue-admin/venues/create"
                                className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                            >
                                List your venue
                                <ArrowRight className="size-3.5" aria-hidden />
                            </MagneticLink>
                        ) : (
                            <>
                                {canRegister && (
                                    <MagneticLink
                                        href={`${register().url}?intent=venue_owner`}
                                        className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                    >
                                        Apply as host
                                        <ArrowRight className="size-3.5" aria-hidden />
                                    </MagneticLink>
                                )}
                                <Link
                                    href={login().url}
                                    className="inline-flex items-center px-1 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#3e2817]/80 underline-offset-8 transition hover:text-[#f37021] hover:underline"
                                >
                                    I already have an account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

/* ── Magnetic link — CTA buttons with gentle cursor pull ─────────────── */
function MagneticLink({
    href,
    className,
    children,
}: {
    href: string;
    className: string;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
            const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
            gsap.to(el, { x: dx, y: dy, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        };
        const onLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
        };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <Link ref={ref} href={href} className={className}>
            {children}
        </Link>
    );
}

/* ── Reservation card — 3D perspective tilt + shine + Z-depth layers ─── */
type ReservationCardProps = {
    search: string;
    city: string;
    cities: string[];
    onSearchChange: (v: string) => void;
    onCityChange: (v: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

function ReservationCard({
    search,
    city,
    cities,
    onSearchChange,
    onCityChange,
    onSubmit,
}: ReservationCardProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="relative bg-[#3e2817] p-8 text-[#faf5ec] shadow-[0_40px_80px_-20px_rgba(62,40,23,0.5)] sm:p-10"
        >
            <div className="absolute top-0 left-0 h-[3px] w-full bg-[#f37021]" />

            <div className="mb-8 flex items-center gap-4">
                <MiniCourtEmblem className="h-7 w-11 shrink-0 text-[#faf5ec]" />
                <div>
                    <p className="editorial-label text-[#faf5ec]/55">Reserve a court</p>
                    <p className="mt-1 font-sans text-[1.45rem] font-black leading-tight tracking-[-0.03em]">
                        Find your court.
                    </p>
                </div>
            </div>

            <div className="space-y-7">
                <DarkField label="Venue or area">
                    <div className="relative mt-2">
                        <Search
                            className="absolute top-1/2 left-0 size-[14px] -translate-y-1/2 text-[#faf5ec]/40"
                            aria-hidden
                        />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="e.g. Pala-o, Tibanga, Suarez…"
                            className="rounded-none border-0 border-b border-[#faf5ec]/20 bg-transparent px-0 pl-6 font-sans text-[1rem] text-[#faf5ec] shadow-none caret-[#f37021] placeholder:text-[#faf5ec]/30 focus-visible:border-[#f37021] focus-visible:ring-0"
                        />
                    </div>
                </DarkField>

                <DarkField label="City">
                    <div className="relative mt-2">
                        <MapPin
                            className="absolute top-1/2 left-0 size-[14px] -translate-y-1/2 text-[#faf5ec]/40"
                            aria-hidden
                        />
                        <Select value={city} onValueChange={onCityChange}>
                            <SelectTrigger className="mt-0 h-auto rounded-none border-0 border-b border-[#faf5ec]/20 bg-transparent pl-6 pr-0 py-2 font-sans text-[1rem] text-[#faf5ec] shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0 [&>svg]:text-[#faf5ec]/50">
                                <SelectValue placeholder="Iligan City" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-[#3e2817]/20">
                                <SelectItem value="all">All of Iligan</SelectItem>
                                {cities.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DarkField>
            </div>

            <div className="group relative mt-9 overflow-hidden">
                <Button
                    type="submit"
                    size="lg"
                    className="h-auto w-full rounded-none bg-[#f37021] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white shadow-none transition-colors hover:bg-[#d85a14]"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Search venues
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                </Button>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[220%]"
                />
            </div>

            <p className="mt-5 text-center text-[10.5px] font-sans uppercase tracking-[0.24em] text-[#faf5ec]/40">
                No fees · Confirm in seconds
            </p>
        </form>
    );
}

function DarkField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#faf5ec]/50">
                {label}
            </span>
            {children}
        </label>
    );
}

/* ── Accent components ───────────────────────────────────────────────── */
function PulseDot() {
    return (
        <span aria-hidden className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-[#f37021] opacity-30" />
            <span className="relative inline-flex h-5 w-5 rounded-full bg-[#f37021]" />
        </span>
    );
}

function BounceBall() {
    return (
        <span aria-hidden className="inline-block h-[18px] w-[11px] animate-bounce rounded-full bg-[#f37021] opacity-75" />
    );
}

/* ── Display primitives ──────────────────────────────────────────────── */
function SectionHeading({
    eyebrow,
    title,
    copy,
}: {
    eyebrow: string;
    title: React.ReactNode;
    copy?: string;
}) {
    return (
        <div className="max-w-2xl">
            <p className="editorial-label">{eyebrow}</p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,4vw,3.2rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#3e2817]">
                {title}
            </h2>
            {copy && (
                <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-[#5c3a21]">
                    {copy}
                </p>
            )}
        </div>
    );
}

/* ── Reusable 3D tilt wrapper ────────────────────────────────────────── */
function Tilt3D({
    children,
    className,
    intensityX = 5,
    intensityY = 8,
    hoverScale = 1.02,
}: {
    children: React.ReactNode;
    className?: string;
    intensityX?: number;
    intensityY?: number;
    hoverScale?: number;
}) {
    const ref = useTilt3D<HTMLDivElement>({ intensityX, intensityY, hoverScale });
    return (
        <div
            ref={ref}
            className={className}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
            {children}
        </div>
    );
}

/* ── Sport tile — 3D hover with Z-depth inner layers ────────────────── */
function SportTile({
    name,
    copy,
    featured,
}: {
    name: string;
    copy: string;
    featured?: boolean;
}) {
    const sportName = name as SportName;
    const ref = useTilt3D<HTMLDivElement>({
        intensityX: 5,
        intensityY: 7,
        hoverScale: 1.025,
        resetDuration: 1.0,
        resetEase: 'elastic.out(1, 0.45)',
    });

    return (
        <div
            ref={ref}
            className={
                featured
                    ? 'group relative flex flex-col gap-5 overflow-hidden bg-[#3e2817] p-9 text-[#faf5ec]'
                    : 'group relative flex flex-col gap-5 overflow-hidden bg-white p-9 text-[#3e2817] transition-colors hover:bg-[#faf5ec]'
            }
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
            {/* Sport icon — large, bleeds off bottom-right so the animated ball stays visible */}
            <div
                aria-hidden
                className={
                    featured
                        ? 'pointer-events-none absolute -right-2 -bottom-2 h-56 w-56 opacity-60'
                        : 'pointer-events-none absolute -right-2 -bottom-2 h-56 w-56 opacity-40'
                }
                style={{ transform: 'translateZ(24px)' }}
            >
                <SportIcon sport={sportName} className="h-full w-full" />
            </div>

            <p
                className={featured ? 'editorial-label text-[#faf5ec]/65' : 'editorial-label'}
                style={{ transform: 'translateZ(6px)' }}
            >
                {featured ? 'In season' : 'Sport'}
            </p>
            <h3
                className="font-sans text-3xl font-black tracking-[-0.03em]"
                style={{ transform: 'translateZ(14px)' }}
            >
                {name}
            </h3>
            <p
                className={
                    featured
                        ? 'font-sans text-sm leading-relaxed text-[#faf5ec]/75'
                        : 'font-sans text-sm leading-relaxed text-[#5c3a21]'
                }
                style={{ transform: 'translateZ(8px)' }}
            >
                {copy}
            </p>
            <Link
                href="/venues"
                className={
                    featured
                        ? 'mt-auto inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f37021] transition hover:text-white'
                        : 'mt-auto inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]'
                }
                style={{ transform: 'translateZ(18px)' }}
            >
                Browse venues <ArrowRight className="size-3" aria-hidden />
            </Link>
        </div>
    );
}

function ValueProp({
    number,
    title,
    copy,
    showBounce,
}: {
    number: string;
    title: string;
    copy: string;
    showBounce?: boolean;
}) {
    return (
        <div className="space-y-3 border-t border-[#faf5ec]/20 pt-6">
            <div className="flex items-start justify-between gap-4">
                <p className="font-sans text-sm font-bold tracking-[0.2em] text-[#f37021]">
                    — {number}
                </p>
                {showBounce && (
                    <div aria-hidden className="-mt-1">
                        <BounceBall />
                    </div>
                )}
            </div>
            <h3 className="font-sans text-2xl font-black tracking-[-0.02em]">{title}</h3>
            <p className="font-sans text-sm leading-relaxed text-[#faf5ec]/80">{copy}</p>
        </div>
    );
}
