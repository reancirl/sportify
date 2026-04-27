import { useGSAP } from '@gsap/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AnimatedCounter } from '@/components/landing/animated-counter';
import { BallTrajectory } from '@/components/landing/ball-trajectory';
import { CourtOrnament } from '@/components/landing/court-ornament';
import { CursorBall } from '@/components/landing/cursor-ball';
import { FloatingBalls } from '@/components/landing/floating-balls';
import { JerseyNumber } from '@/components/landing/jersey-number';
import { MagneticLink } from '@/components/landing/magnetic-link';
import { Marquee } from '@/components/landing/marquee';
import { MiniCourt } from '@/components/landing/mini-court';
import { ParticleField } from '@/components/landing/particle-field';
import { ScoreboardStat } from '@/components/landing/scoreboard-stat';
import { SectionDivider } from '@/components/landing/section-divider';
import { SectionRail } from '@/components/landing/section-rail';
import type { RailSection } from '@/components/landing/section-rail';
import { SlashAccent } from '@/components/landing/slash-accent';
import { SportIcon } from '@/components/landing/sport-icon';
import { PaginationNav } from '@/components/pagination-nav';
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
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import { index as venuesIndex } from '@/routes/venues';
import { create as venueAdminCreate } from '@/routes/venue-admin/venues';
import type { Models } from '@/types';

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

const RAIL_SECTIONS: RailSection[] = [
    { id: 'hero', label: 'Hero', index: '00' },
    { id: 'sports', label: 'Sports', index: '01' },
    { id: 'venues', label: 'Venues', index: '02' },
    { id: 'membership', label: 'Membership', index: '03' },
    { id: 'hosts', label: 'Hosts', index: '04' },
];

export default function Landing({
    venues,
    cities,
    filters,
    canRegister = true,
}: Props) {
    const { auth, sportify } = usePage().props;
    const user = auth.user;
    const { sports, region, brand } = sportify;

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

    /* ── Section refs ──────────────────────────────────────────────────── */
    const heroRef = useRef<HTMLElement>(null);
    const ornamentRef = useRef<SVGSVGElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const heroParagraphRef = useRef<HTMLParagraphElement>(null);
    const heroCtaRef = useRef<HTMLDivElement>(null);
    const heroCardRef = useRef<HTMLDivElement>(null);
    const heroStatsRef = useRef<HTMLDivElement>(null);

    const sportsRef = useReveal<HTMLElement>({ stagger: 0.12, y: 28 });
    const venuesRef = useReveal<HTMLElement>({ stagger: 0.06, y: 28 });
    const membershipRef = useRef<HTMLElement>(null);
    const hostsRef = useReveal<HTMLElement>({ stagger: 0.08, y: 24 });

    const currentYear = new Date().getFullYear();

    /* ── Marquee items ─────────────────────────────────────────────────── */
    const marqueeItems = [
        ...sports.map((s) => s.name),
        region.city,
        'Members Club',
        `Est. ${currentYear}`,
        brand.name,
        region.short_city,
    ];

    /* ── Hero entrance timeline (SplitText H1) ────────────────────────── */
    useGSAP(
        () => {
            if (!heroRef.current) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const tl = gsap.timeline({
                    defaults: { ease: 'power3.out' },
                    delay: 0.08,
                });

                // Eyebrow
                tl.from(eyebrowRef.current, {
                    opacity: 0,
                    y: 12,
                    duration: 0.5,
                });

                // SplitText H1 — character-by-character 3D reveal
                let split: InstanceType<typeof SplitText> | null = null;
                if (h1Ref.current) {
                    split = new SplitText(h1Ref.current, { type: 'chars,words' });
                    gsap.set(split.chars, { perspective: 400 });
                    tl.from(
                        split.chars,
                        {
                            y: 60,
                            opacity: 0,
                            rotateX: -50,
                            transformOrigin: '50% 100%',
                            duration: 0.55,
                            stagger: 0.015,
                            ease: 'power3.out',
                        },
                        '-=0.15',
                    );
                }

                // Body paragraph
                tl.from(
                    heroParagraphRef.current,
                    { opacity: 0, y: 20, duration: 0.7 },
                    '-=0.35',
                );

                // CTAs
                tl.from(
                    heroCtaRef.current,
                    { opacity: 0, y: 16, scale: 0.97, duration: 0.6 },
                    '-=0.45',
                );

                // Reservation card
                tl.from(
                    heroCardRef.current,
                    { opacity: 0, x: 40, duration: 1.0 },
                    0.25,
                );

                // Ornament
                tl.from(
                    ornamentRef.current,
                    { opacity: 0, scale: 0.9, duration: 1.6, ease: 'power2.out' },
                    0.1,
                );

                // Stats strip
                tl.from(
                    heroStatsRef.current,
                    { opacity: 0, y: 16, duration: 0.6 },
                    '-=0.25',
                );

                // Parallax ornament on scroll
                if (ornamentRef.current) {
                    ScrollTrigger.create({
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1,
                        onUpdate(self) {
                            if (ornamentRef.current) {
                                gsap.set(ornamentRef.current, {
                                    yPercent: self.progress * 18,
                                });
                            }
                        },
                    });
                }

                return () => {
                    split?.revert();
                    mm.revert();
                };
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                const targets = [
                    eyebrowRef.current,
                    h1Ref.current,
                    heroParagraphRef.current,
                    heroCtaRef.current,
                    heroCardRef.current,
                    ornamentRef.current,
                    heroStatsRef.current,
                ];
                gsap.set(targets, { opacity: 1, y: 0, x: 0, clipPath: 'none', scale: 1 });
                return () => mm.revert();
            });
        },
        { scope: heroRef },
    );

    /* ── Membership section — numeral flip ────────────────────────────── */
    useGSAP(
        () => {
            if (!membershipRef.current) {
                return;
            }

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const numerals = membershipRef.current!.querySelectorAll<HTMLElement>('[data-numeral]');
                const reveals = membershipRef.current!.querySelectorAll<HTMLElement>('[data-reveal]');

                gsap.fromTo(
                    reveals,
                    { opacity: 0, y: 28 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.09,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: membershipRef.current,
                            start: 'top 85%',
                            once: true,
                        },
                    },
                );

                gsap.fromTo(
                    numerals,
                    { rotateX: 90, opacity: 0 },
                    {
                        rotateX: 0,
                        opacity: 1,
                        duration: 0.7,
                        stagger: 0.15,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: membershipRef.current,
                            start: 'top 80%',
                            once: true,
                        },
                    },
                );

                return () => mm.revert();
            });

            mm.add('(prefers-reduced-motion: reduce)', () => {
                const all = membershipRef.current!.querySelectorAll<HTMLElement>('[data-reveal], [data-numeral]');
                gsap.set(all, { opacity: 1, y: 0, rotateX: 0 });
                return () => mm.revert();
            });
        },
        { scope: membershipRef },
    );

    return (
        <>
            <Head title={`A members-club for racquet sports in ${region.city}`}>
                <meta
                    name="description"
                    content={`${brand.name}.${brand.tld} — a members-club for racquet courts in ${region.city}. Reserve courts, discover open play sessions, and meet serious players.`}
                />
            </Head>

            {/* Film-grain luxury texture — fixed, full-page */}
            <div aria-hidden className="grain-overlay" />

            {/* Fixed section rail — lg+ only */}
            <SectionRail sections={RAIL_SECTIONS} />

            {/* ——— 00 / Hero ——————————————————————————————————————————— */}
            <section
                ref={heroRef}
                id="hero"
                className="relative overflow-hidden bg-cream"
            >
                {/* Ambient floating orbs — depth & warmth */}
                <FloatingBalls />

                {/* Tactical court diagram ornament */}
                <CourtOrnament ref={ornamentRef} />

                {/* Cursor-following ball with trail — hero only */}
                <CursorBall parentRef={heroRef} />

                <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-6 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:grid-cols-[1.55fr_1fr] lg:gap-20 lg:px-14 lg:pt-24 lg:pb-28">
                    {/* Left — broadcast-grade copy */}
                    <div className="space-y-8">
                        {/* Eyebrow row with LIVE indicator */}
                        <div className="flex items-center justify-between gap-4">
                            <p
                                ref={eyebrowRef}
                                className="almanac-index"
                            >
                                — 00 / {region.city} ·{' '}
                                {sports.map((s) => s.name).join(' · ')}
                            </p>
                            <LiveIndicator city={region.city} />
                        </div>

                        {/*
                         * H1: Fraunces Black — chunky display cut, NOT editorial.
                         * Uppercase, ultra-tight tracking. SplitText per-char 3D reveal.
                         */}
                        <h1
                            ref={h1Ref}
                            className="font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-black uppercase leading-[0.94] tracking-[-0.04em] text-chocolate"
                        >
                            A members-club for racquet sports in {region.city}
                            <span className="text-hermes">.</span>
                        </h1>

                        <p
                            ref={heroParagraphRef}
                            className="max-w-xl font-sans text-lg font-medium leading-relaxed text-chocolate-soft"
                        >
                            Reserve premium courts at curated venues across{' '}
                            {region.short_city}. Discover open play sessions.
                            Meet players who take the game as seriously as you
                            do.
                        </p>

                        <div
                            ref={heroCtaRef}
                            className="flex flex-wrap items-center gap-4 pt-2"
                        >
                            {user ? (
                                <MagneticLink
                                    prefetch
                                    href={dashboard().url}
                                    className="inline-flex bg-chocolate px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition hover:bg-chocolate-deep"
                                >
                                    Open dashboard
                                    <ArrowRight className="size-3.5" aria-hidden />
                                </MagneticLink>
                            ) : (
                                <>
                                    {canRegister && (
                                        <MagneticLink
                                            prefetch
                                            href={register().url}
                                            className="inline-flex bg-chocolate px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition hover:bg-chocolate-deep"
                                        >
                                            Become a member
                                            <ArrowRight
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                        </MagneticLink>
                                    )}
                                    <Link
                                        prefetch
                                        href={login().url}
                                        className="inline-flex items-center px-2 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-chocolate/80 underline-offset-8 transition hover:text-hermes hover:underline"
                                    >
                                        Members log in
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* ── B2: Scoreboard stat strip ─────────────────── */}
                        <div
                            ref={heroStatsRef}
                            className="grid grid-cols-3 gap-px border border-chocolate/20 bg-chocolate/20"
                        >
                            <ScoreboardStat
                                value={
                                    <AnimatedCounter to={venues.total} duration={1.6} />
                                }
                                label={venues.total === 1 ? 'Verified venue' : 'Verified venues'}
                            />
                            <ScoreboardStat
                                value={region.short_city}
                                label={region.tagline}
                            />
                            <ScoreboardStat
                                value={
                                    <AnimatedCounter to={sports.length} duration={1.2} />
                                }
                                label="Sports"
                            />
                        </div>
                    </div>

                    {/* Right — reservation card */}
                    <div ref={heroCardRef} className="lg:pt-2">
                        <ReservationCard
                            search={search}
                            city={city}
                            cities={cities}
                            regionCity={region.city}
                            regionShortCity={region.short_city}
                            sampleAreas={region.sample_areas}
                            onSearchChange={setSearch}
                            onCityChange={setCity}
                            onSubmit={handleSearch}
                        />
                    </div>
                </div>

                {/* Animated lob-shot trajectory arc */}
                <BallTrajectory />
            </section>

            {/* ——— B4: Marquee with diagonal racing stripe ————————————— */}
            <div className="relative overflow-hidden">
                {/* Diagonal racing stripe behind marquee text */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        background: `repeating-linear-gradient(
                            -25deg,
                            transparent,
                            transparent 40px,
                            var(--color-hermes-deep) 40px,
                            var(--color-hermes-deep) 44px
                        )`,
                        opacity: 0.06,
                    }}
                />
                <Marquee items={marqueeItems} duration={28} />
            </div>

            {/* ——— Court baseline divider ——————————————————————————————— */}
            <SectionDivider className="bg-cream" />

            {/* ——— 01 / The Sports —————————————————————————————————————— */}
            <section
                ref={sportsRef}
                id="sports"
                className="border-t border-chocolate/10 bg-cream"
            >
                <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
                    <div data-reveal className="mb-12">
                        <SectionHeading
                            index="01"
                            eyebrow="The Sports"
                            title={
                                <>
                                    Three{' '}
                                    <span className="italic">games</span>
                                    <span className="text-hermes">.</span>
                                    <br />
                                    One{' '}
                                    <span className="text-stroke text-chocolate">
                                        club
                                    </span>
                                    <span className="text-hermes">.</span>
                                </>
                            }
                        />
                    </div>

                    <div className="grid gap-px overflow-hidden border border-chocolate/15 bg-chocolate/15 sm:grid-cols-3">
                        {sports.map((sport) => (
                            <div data-reveal key={sport.slug}>
                                <SportTile
                                    name={sport.name}
                                    copy={sport.tagline}
                                    featured={sport.featured}
                                    season={sport.season}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ——— Court baseline divider ——————————————————————————————— */}
            <SectionDivider className="bg-cream" />

            {/* ——— 02 / Featured Venues ——————————————————————————————— */}
            <section
                ref={venuesRef}
                id="venues"
                className="border-t border-chocolate/10 bg-cream"
            >
                <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
                    <div
                        data-reveal
                        className="flex flex-wrap items-end justify-between gap-4"
                    >
                        <SectionHeading
                            index="02"
                            eyebrow={`The Venues · ${region.city}`}
                            title={
                                <>
                                    Where
                                    <br />
                                    members{' '}
                                    <span className="italic text-hermes">
                                        play
                                    </span>
                                    <span className="text-hermes not-italic">.</span>
                                </>
                            }
                            copy="A short list of venues, hand-vetted for quality of play, surface condition, and the welcome you receive at the door."
                        />
                        <Link
                            prefetch
                            href={venuesIndex().url}
                            className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-chocolate hover:text-hermes sm:inline-flex"
                        >
                            Browse all venues
                            <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>

                    {venues.data.length === 0 ? (
                        <Card
                            data-reveal
                            className="mt-12 border-chocolate/15 bg-white"
                        >
                            <CardContent className="py-16 text-center font-sans text-chocolate-soft">
                                No venues match your search yet. Try widening
                                your filters.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {venues.data.map((venue) => (
                                <div data-reveal key={venue.id}>
                                    <VenueCard venue={venue} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12">
                        <PaginationNav paginated={venues} />
                    </div>
                </div>
            </section>

            {/* ——— 03 / Membership manifesto ——————————————————————————— */}
            <section
                ref={membershipRef}
                id="membership"
                className="relative overflow-hidden bg-chocolate text-cream"
            >
                {/* Constellation particle field — twinkling dot grid */}
                <ParticleField
                    cols={14}
                    rows={9}
                    className="pointer-events-none absolute inset-0"
                />

                <div className="relative mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 sm:py-32 lg:px-14">
                    <div data-reveal className="flex items-center gap-3">
                        <div className="h-[2px] w-10 bg-hermes" />
                        <p className="almanac-index text-hermes">
                            03 / Membership
                        </p>
                    </div>

                    <h2
                        data-reveal
                        className="mt-6 max-w-5xl font-display text-[clamp(3rem,6.5vw,5.8rem)] font-black uppercase leading-[0.86] tracking-[-0.05em]"
                    >
                        Booking,{' '}
                        <span className="italic">refined</span>
                        <br />
                        to its{' '}
                        <span className="text-stroke text-cream">
                            essential
                        </span>
                        <br />
                        gestures<span className="text-hermes">.</span>
                    </h2>

                    {/* Broadcast lower-third pull quote */}
                    <blockquote
                        data-reveal
                        className="mt-10 max-w-2xl border-l-4 border-hermes pl-6 font-sans text-[clamp(1rem,2vw,1.4rem)] font-medium text-cream/75"
                    >
                        The most powerful thing we offer is the absence of friction.
                    </blockquote>

                    <div className="mt-16 grid gap-12 md:grid-cols-3">
                        <div data-reveal>
                            <ValueProp
                                number="01"
                                title="Curated venues"
                                copy="Every venue is reviewed before going live. Surface, lighting, amenities — all judged before approval."
                            />
                        </div>
                        <div data-reveal>
                            <ValueProp
                                number="02"
                                title="One-hour reservations"
                                copy="Choose a court. Choose a time. Confirm. Speed is the luxury."
                            />
                        </div>
                        <div data-reveal>
                            <ValueProp
                                number="03"
                                title="Open play, well-matched"
                                copy="Drop into sessions sized to your level — meet players who play the way you do, in the city you live in."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ——— Court baseline divider ——————————————————————————————— */}
            <SectionDivider className="bg-cream" />

            {/* ——— 04 / For Hosts ——————————————————————————————————————— */}
            <section ref={hostsRef} id="hosts" className="bg-cream">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-14">
                    <div data-reveal className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-10 bg-hermes" />
                            <p className="almanac-index">04 / For Hosts</p>
                        </div>
                        <h2 className="font-display text-[clamp(3rem,6vw,5.4rem)] font-black uppercase leading-[0.86] tracking-[-0.05em] text-chocolate">
                            Run a venue
                            <br />
                            worth{' '}
                            <span className="italic text-hermes">
                                discovering
                            </span>
                            <span className="text-hermes not-italic">?</span>
                        </h2>
                        <p className="max-w-xl font-sans text-lg font-medium leading-relaxed text-chocolate-soft">
                            List your courts on {brand.name}
                            <span className="font-black text-hermes">.{brand.tld}</span>{' '}
                            and connect with members who value your craft. We
                            handle the bookings; you do what you do best.
                        </p>
                    </div>

                    <div
                        data-reveal
                        className="flex flex-col items-start justify-center gap-4 lg:items-end"
                    >
                        {user ? (
                            <MagneticLink
                                prefetch
                                href={venueAdminCreate().url}
                                className="inline-flex bg-chocolate px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition hover:bg-chocolate-deep"
                            >
                                List your venue
                                <ArrowRight
                                    className="size-3.5"
                                    aria-hidden
                                />
                            </MagneticLink>
                        ) : (
                            <>
                                {canRegister && (
                                    <MagneticLink
                                        prefetch
                                        href={`${register().url}?intent=venue_owner`}
                                        className="inline-flex bg-chocolate px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition hover:bg-chocolate-deep"
                                    >
                                        Apply as host
                                        <ArrowRight
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                    </MagneticLink>
                                )}
                                <Link
                                    prefetch
                                    href={login().url}
                                    className="inline-flex items-center px-1 py-2 text-xs font-medium uppercase tracking-[0.22em] text-chocolate/80 underline-offset-8 transition hover:text-hermes hover:underline"
                                >
                                    I already have an account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ——— Sign-off rule ——————————————————————————————————————— */}
            <div className="border-t border-chocolate/15 bg-cream px-6 py-6 sm:px-10 lg:px-14">
                <p className="almanac-index text-chocolate/40">
                    {brand.name}
                    <span className="font-black text-hermes">.{brand.tld}</span>
                    {' '}· {region.city}
                    <span className="text-hermes"> · </span>
                    {currentYear}
                </p>
            </div>
        </>
    );
}

/* ── B1: LIVE broadcast indicator ────────────────────────────────────── */

function LiveIndicator({ city }: { city: string }) {
    return (
        <div className="flex shrink-0 items-center gap-2">
            {/*
             * Pulsing dot — CSS keyframe.
             * Reduce-motion: static (animation: none via Tailwind motion-safe).
             */}
            <span
                aria-hidden
                className="block h-2 w-2 rounded-full bg-hermes motion-safe:animate-pulse"
            />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-hermes">
                Live · {city.toUpperCase()}
            </span>
        </div>
    );
}

/* ── Hero reservation card ───────────────────────────────────────────── */

type ReservationCardProps = {
    search: string;
    city: string;
    cities: string[];
    regionCity: string;
    regionShortCity: string;
    sampleAreas: string[];
    onSearchChange: (v: string) => void;
    onCityChange: (v: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

function ReservationCard({
    search,
    city,
    cities,
    regionCity,
    regionShortCity,
    sampleAreas,
    onSearchChange,
    onCityChange,
    onSubmit,
}: ReservationCardProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="relative border-2 border-chocolate/20 bg-white p-7 shadow-[0_40px_80px_-30px_rgba(62,40,23,0.28)] sm:p-9"
        >
            {/* Diagonal speed accent — top-right corner */}
            <div aria-hidden className="pointer-events-none absolute top-0 right-0 h-10 w-10 overflow-hidden">
                <div
                    className="absolute"
                    style={{
                        top: '-2px',
                        right: '-2px',
                        width: '0',
                        height: '0',
                        borderStyle: 'solid',
                        borderWidth: '0 40px 40px 0',
                        borderColor: `transparent var(--color-hermes) transparent transparent`,
                        opacity: 0.15,
                    }}
                />
            </div>

            <p className="almanac-index text-hermes">Reserve · Tonight</p>
            <h2 className="mt-4 font-sans text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-chocolate sm:text-[1.8rem]">
                Find your court.
            </h2>

            <div className="mt-7 space-y-5">
                <Field label="Venue or area">
                    <div className="relative">
                        <Search
                            className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-chocolate-soft/60"
                            aria-hidden
                        />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`e.g. ${sampleAreas.join(', ')}`}
                            className="rounded-none border-0 border-b border-chocolate/25 bg-transparent px-0 pl-7 font-sans text-base text-chocolate shadow-none placeholder:text-chocolate-soft/45 focus-visible:border-hermes focus-visible:ring-0"
                        />
                    </div>
                </Field>

                <Field label="City">
                    <Select value={city} onValueChange={onCityChange}>
                        <SelectTrigger className="h-auto rounded-none border-0 border-b border-chocolate/25 bg-transparent px-0 py-2 font-sans text-base text-chocolate shadow-none focus:ring-0 focus-visible:border-hermes focus-visible:ring-0 [&>svg]:text-chocolate-soft/60">
                            <SelectValue placeholder={regionCity} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All of {regionShortCity}
                            </SelectItem>
                            {cities.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            <Button
                type="submit"
                size="lg"
                className="mt-8 h-auto w-full rounded-none bg-hermes px-7 py-4 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-none transition hover:bg-hermes-deep"
            >
                Search venues
            </Button>

            <p className="mt-5 text-center font-sans text-[11px] uppercase tracking-[0.22em] text-chocolate-soft/70">
                No fees · Confirm in seconds
            </p>
        </form>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="editorial-label mb-2 block">{label}</span>
            {children}
        </label>
    );
}

/* ── SectionHeading — Geist Black uppercase ──────────────────────────── */

function SectionHeading({
    index,
    eyebrow,
    title,
    copy,
}: {
    index?: string;
    eyebrow: string;
    title: ReactNode;
    copy?: string;
}) {
    return (
        <div className="max-w-3xl">
            <div className="relative">
                {/* Orange speed-stripe accent */}
                <div className="mb-4 h-[2px] w-10 bg-hermes" />

                {/* Eyebrow row */}
                {index && (
                    <div className="mb-5 flex items-center gap-4">
                        <JerseyNumber number={index} />
                        <p className="almanac-index">{eyebrow}</p>
                    </div>
                )}
                {!index && <p className="almanac-index mb-5">{eyebrow}</p>}

                {/* Heading — Fraunces Black display, big but not breaking */}
                <h2 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-chocolate">
                    {title}
                </h2>

                {copy && (
                    <p className="mt-6 max-w-xl font-sans text-base font-medium leading-relaxed text-chocolate-soft">
                        {copy}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── SportTile ───────────────────────────────────────────────────────── */

function SportTile({
    name,
    copy,
    featured,
    season,
}: {
    name: string;
    copy: string;
    featured?: boolean;
    season?: string | null;
}) {
    const eyebrow = featured ? (season ?? 'In season') : 'Sport';

    return (
        <div
            className={cn(
                'group relative flex flex-col gap-5 overflow-hidden p-9 transition-colors',
                featured
                    ? 'bg-chocolate text-cream'
                    : 'bg-cream text-chocolate hover:bg-white',
            )}
        >
            <p
                className={cn(
                    'almanac-index',
                    featured ? 'text-hermes' : '',
                )}
            >
                {eyebrow}
            </p>

            {/* Sport name: Fraunces display — editorial luxury */}
            <h3 className="font-display text-[clamp(2rem,3.2vw,3rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
                {name}
                <span className="text-hermes">.</span>
            </h3>

            {/* Animated sport-specific SVG icon — self-draws on scroll */}
            <SportIcon
                sportName={name}
                className={cn(
                    'pointer-events-none absolute right-5 bottom-5 h-28 w-28 transition-opacity duration-500 group-hover:opacity-60',
                    featured ? 'text-cream opacity-[0.16]' : 'text-chocolate opacity-[0.12]',
                )}
            />

            {/* Tiny court diagram — top-right accent */}
            <MiniCourt
                className={cn(
                    'absolute right-5 top-5 h-10 w-14 opacity-10 transition-opacity group-hover:opacity-20',
                    featured ? 'text-cream' : 'text-chocolate',
                )}
            />

            <p
                className={cn(
                    'font-sans text-sm font-medium leading-relaxed',
                    featured ? 'text-cream/75' : 'text-chocolate-soft',
                )}
            >
                {copy}
            </p>

            <Link
                href={venuesIndex().url}
                className={cn(
                    'mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] transition',
                    featured
                        ? 'text-hermes hover:text-white'
                        : 'text-chocolate hover:text-hermes',
                )}
            >
                Browse venues <ArrowRight className="size-3" aria-hidden />
            </Link>
        </div>
    );
}

/* ── ValueProp ───────────────────────────────────────────────────────── */

function ValueProp({
    number,
    title,
    copy,
}: {
    number: string;
    title: string;
    copy: string;
}) {
    return (
        <div className="space-y-4 border-t-2 border-hermes/40 pt-6">
            {/* Giant jersey number */}
            <p
                data-numeral
                className="font-display text-[5rem] font-black leading-none tracking-[-0.06em] text-hermes"
            >
                {number}
            </p>
            <h3 className="font-display text-[1.4rem] font-black uppercase leading-tight tracking-[-0.03em] text-cream">
                {title}
            </h3>
            <p className="font-sans text-sm font-medium leading-relaxed text-cream/70">
                {copy}
            </p>
        </div>
    );
}
