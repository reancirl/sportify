import { useGSAP } from '@gsap/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ArrowRight, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
import { dashboard, login, register } from '@/routes';
import type { Models, User } from '@/types';

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
    const sportsRef = useReveal<HTMLElement>({ stagger: 0.1, y: 28 });
    const venuesRef = useReveal<HTMLElement>({ stagger: 0.06, y: 28 });
    const membershipRef = useReveal<HTMLElement>({ stagger: 0.09, y: 28 });
    const hostsRef = useReveal<HTMLElement>({ stagger: 0.08, y: 24 });

    useGSAP(
        () => {
            if (!heroRef.current) {
                return;
            }

            const reduce = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;

            if (reduce) {
                return;
            }

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out', duration: 1 },
                delay: 0.1,
            });

            tl.from('[data-hero-copy]', {
                opacity: 0,
                y: 28,
                stagger: 0.08,
            })
                .from(
                    '[data-hero-card]',
                    { opacity: 0, x: 32, duration: 1.1 },
                    '-=0.85',
                )
                .from(
                    '[data-hero-ornament]',
                    { opacity: 0, scale: 0.92, duration: 1.4 },
                    '-=1',
                );
        },
        { scope: heroRef },
    );

    return (
        <>
            <Head title="A members-club for racquet sports in Iligan City" />

            {/* — — — Hero — — — */}
            <section
                ref={heroRef}
                className="relative overflow-hidden bg-[#faf5ec]"
            >
                <BackdropOrnament />

                <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-6 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:px-14 lg:pt-24 lg:pb-28">
                    <div className="space-y-8">
                        <p data-hero-copy className="editorial-label">
                            Iligan City · Tennis · Pickleball · Badminton
                        </p>

                        <h1
                            data-hero-copy
                            className="font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#3e2817]"
                        >
                            A members-club
                            <br />
                            for racquet sports
                            <br />
                            in Iligan City
                            <span className="text-[#f37021]">.</span>
                        </h1>

                        <p
                            data-hero-copy
                            className="max-w-xl font-serif text-lg leading-relaxed text-[#5c3a21]"
                        >
                            Reserve premium courts at curated venues across
                            Iligan. Discover open play sessions. Meet players
                            who take the game as seriously as you do — without
                            the queue at the front desk.
                        </p>

                        <div
                            data-hero-copy
                            className="flex flex-wrap items-center gap-4 pt-2"
                        >
                            {user ? (
                                <Link
                                    href={dashboard().url}
                                    className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                >
                                    Open dashboard
                                    <ArrowRight className="size-3.5" aria-hidden />
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register().url}
                                            className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                        >
                                            Become a member
                                            <ArrowRight
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                        </Link>
                                    )}
                                    <Link
                                        href={login().url}
                                        className="inline-flex items-center px-2 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#3e2817]/80 underline-offset-8 transition hover:text-[#f37021] hover:underline"
                                    >
                                        Members log in
                                    </Link>
                                </>
                            )}
                        </div>

                        <dl
                            data-hero-copy
                            className="grid grid-cols-3 gap-6 border-t border-[#3e2817]/15 pt-8"
                        >
                            <Stat
                                value={venues.total.toString()}
                                label={
                                    venues.total === 1
                                        ? 'Verified venue'
                                        : 'Verified venues'
                                }
                            />
                            <Stat value="Iligan" label="City of Majestic Falls" />
                            <Stat value="3" label="Sports" />
                        </dl>
                    </div>

                    {/* Reservation card — the booking moment, refined */}
                    <div data-hero-card className="lg:pt-2">
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

            {/* — — — The Sports — — — */}
            <section
                ref={sportsRef}
                id="sports"
                className="border-t border-[#3e2817]/10 bg-[#faf5ec]"
            >
                <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
                    <div data-reveal>
                        <SectionHeading
                            eyebrow="The Sports"
                            title={
                                <>
                                    Three games. One{' '}
                                    <span className="italic text-[#f37021]">
                                        club
                                    </span>
                                    .
                                </>
                            }
                        />
                    </div>

                    <div className="mt-12 grid gap-px overflow-hidden border border-[#3e2817]/15 bg-[#3e2817]/15 sm:grid-cols-3">
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

            {/* — — — Featured Venues — — — */}
            <section
                ref={venuesRef}
                className="border-t border-[#3e2817]/10 bg-[#faf5ec]"
            >
                <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
                    <div
                        data-reveal
                        className="flex flex-wrap items-end justify-between gap-4"
                    >
                        <SectionHeading
                            eyebrow="The Venues · Iligan City"
                            title={
                                <>
                                    Where members{' '}
                                    <span className="italic text-[#f37021]">
                                        play
                                    </span>
                                </>
                            }
                            copy="A short list of venues, hand-vetted for quality of play, surface condition, and the welcome you receive at the door."
                        />
                        <Link
                            href="/venues"
                            className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#3e2817] hover:text-[#f37021] sm:inline-flex"
                        >
                            Browse all venues
                            <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>

                    {venues.data.length === 0 ? (
                        <Card
                            data-reveal
                            className="mt-12 border-[#3e2817]/15 bg-white"
                        >
                            <CardContent className="py-16 text-center font-serif text-[#5c3a21]">
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

            {/* — — — Membership / Why sportify — — — */}
            <section
                ref={membershipRef}
                id="membership"
                className="bg-[#3e2817] text-[#faf5ec]"
            >
                <div className="mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 sm:py-28 lg:px-14">
                    <p
                        data-reveal
                        className="editorial-label text-[#faf5ec]/65"
                    >
                        Membership
                    </p>
                    <h2
                        data-reveal
                        className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em]"
                    >
                        Booking, refined to its{' '}
                        <span className="italic text-[#f37021]">
                            essential
                        </span>{' '}
                        gestures.
                    </h2>

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
                                copy="Choose a court. Choose a time. Confirm. The most luxurious thing we offer is the absence of friction."
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

            {/* — — — For Hosts — — — */}
            <section ref={hostsRef} id="hosts" className="bg-[#faf5ec]">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-14">
                    <div data-reveal className="space-y-6">
                        <p className="editorial-label">For Hosts</p>
                        <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#3e2817]">
                            Run a venue worth{' '}
                            <span className="italic text-[#f37021]">
                                discovering
                            </span>
                            ?
                        </h2>
                        <p className="max-w-xl font-serif text-lg leading-relaxed text-[#5c3a21]">
                            List your courts on sportify
                            <span className="italic text-[#f37021]">.ph</span>{' '}
                            and connect with members who value your craft. We
                            handle the bookings; you do what you do best.
                        </p>
                    </div>

                    <div
                        data-reveal
                        className="flex flex-col items-start justify-center gap-4 lg:items-end"
                    >
                        {user ? (
                            <Link
                                href="/venue-admin/venues/create"
                                className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                            >
                                List your venue
                                <ArrowRight
                                    className="size-3.5"
                                    aria-hidden
                                />
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={`${register().url}?intent=venue_owner`}
                                        className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                    >
                                        Apply as host
                                        <ArrowRight
                                            className="size-3.5"
                                            aria-hidden
                                        />
                                    </Link>
                                )}
                                <Link
                                    href={login().url}
                                    className="inline-flex items-center px-1 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#3e2817]/80 underline-offset-8 transition hover:text-[#f37021] hover:underline"
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

/* ── Hero reservation card ───────────────────────────────────────────── */

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
            className="relative border border-[#3e2817]/15 bg-white p-7 shadow-[0_30px_60px_-30px_rgba(62,40,23,0.25)] sm:p-9"
        >
            <p className="editorial-label">Reserve a court</p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[-0.01em] text-[#3e2817] sm:text-[1.7rem]">
                Find your court for tonight.
            </h2>

            <div className="mt-7 space-y-5">
                <Field label="Venue or area">
                    <div className="relative">
                        <Search
                            className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-[#5c3a21]/60"
                            aria-hidden
                        />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="e.g. Pala-o, Tibanga, Suarez"
                            className="rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 pl-7 font-serif text-base text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/45 focus-visible:border-[#f37021] focus-visible:ring-0"
                        />
                    </div>
                </Field>

                <Field label="City">
                    <Select value={city} onValueChange={onCityChange}>
                        <SelectTrigger className="h-auto rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 py-2 font-serif text-base text-[#3e2817] shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0 [&>svg]:text-[#5c3a21]/60">
                            <SelectValue placeholder="Iligan City" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All of Iligan</SelectItem>
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
                className="mt-8 h-auto w-full rounded-none bg-[#f37021] px-7 py-4 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-none transition hover:bg-[#d85a14]"
            >
                Search venues
            </Button>

            <p className="mt-5 text-center text-[11px] uppercase tracking-[0.22em] text-[#5c3a21]/70">
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
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="editorial-label mb-2 block">{label}</span>
            {children}
        </label>
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
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#3e2817]">
                {title}
            </h2>
            {copy && (
                <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-[#5c3a21]">
                    {copy}
                </p>
            )}
        </div>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="font-display text-3xl font-bold leading-none tracking-[-0.02em] text-[#3e2817] sm:text-4xl">
                {value}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[#5c3a21]">
                {label}
            </p>
        </div>
    );
}

function SportTile({
    name,
    copy,
    featured,
}: {
    name: string;
    copy: string;
    featured?: boolean;
}) {
    return (
        <div
            className={
                featured
                    ? 'group flex flex-col gap-5 bg-[#3e2817] p-9 text-[#faf5ec] transition-colors'
                    : 'group flex flex-col gap-5 bg-[#faf5ec] p-9 text-[#3e2817] transition-colors hover:bg-white'
            }
        >
            <p
                className={
                    featured
                        ? 'editorial-label text-[#faf5ec]/65'
                        : 'editorial-label'
                }
            >
                {featured ? 'In season' : 'Sport'}
            </p>
            <h3 className="font-display text-3xl font-bold tracking-[-0.02em]">
                {name}
            </h3>
            <p
                className={
                    featured
                        ? 'font-serif text-sm leading-relaxed text-[#faf5ec]/75'
                        : 'font-serif text-sm leading-relaxed text-[#5c3a21]'
                }
            >
                {copy}
            </p>
            <Link
                href="/venues"
                className={
                    featured
                        ? 'mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#f37021] transition hover:text-white'
                        : 'mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021]'
                }
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
}: {
    number: string;
    title: string;
    copy: string;
}) {
    return (
        <div className="space-y-3 border-t border-[#faf5ec]/20 pt-6">
            <p className="font-display text-sm font-bold tracking-[0.2em] text-[#f37021]">
                — {number}
            </p>
            <h3 className="font-display text-2xl font-bold tracking-[-0.01em]">
                {title}
            </h3>
            <p className="font-serif text-sm leading-relaxed text-[#faf5ec]/80">
                {copy}
            </p>
        </div>
    );
}

function BackdropOrnament() {
    return (
        <svg
            aria-hidden
            data-hero-ornament
            className="pointer-events-none absolute -right-16 -top-12 hidden h-[520px] w-[520px] opacity-[0.05] lg:block"
            viewBox="0 0 200 200"
            fill="none"
        >
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                stroke="#3E2817"
                strokeWidth="0.5"
            />
            <line
                x1="10"
                y1="100"
                x2="190"
                y2="100"
                stroke="#3E2817"
                strokeWidth="0.5"
            />
            <line
                x1="100"
                y1="10"
                x2="100"
                y2="190"
                stroke="#3E2817"
                strokeWidth="0.5"
                strokeDasharray="2 3"
            />
            <rect
                x="40"
                y="40"
                width="120"
                height="120"
                stroke="#F37021"
                strokeWidth="0.5"
            />
        </svg>
    );
}
