import { useGSAP } from '@gsap/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ArrowRight, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { VenueCard } from '@/components/venue/venue-card';
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
import { cn } from '@/lib/utils';
import { dashboard, register } from '@/routes';
import type { Models, User } from '@/types';

type VenueListing = Models.Venue & {
    courts_count?: number;
    courts_min_hourly_rate?: string | number | null;
};

type Props = {
    venues: Models.PaginatedResponse<VenueListing>;
    cities: string[];
    filters: { city: string | null; search: string | null };
    canRegister?: boolean;
};

type SportFilter = 'All' | 'Tennis' | 'Pickleball' | 'Badminton';

const SPORT_FILTERS: SportFilter[] = ['All', 'Tennis', 'Pickleball', 'Badminton'];

export default function Home({ venues, cities, filters, canRegister = true }: Props) {
    const { auth } = usePage().props;
    const user = (auth as { user: User | null }).user;

    /* Search bar state — submits to /venues, not / */
    const [search, setSearch] = useState(filters.search ?? '');
    const [city, setCity] = useState<string>(filters.city ?? 'all');

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/venues',
            {
                search: search || undefined,
                city: city === 'all' ? undefined : city,
            },
            { preserveState: false },
        );
    };

    /* Client-side sport filter */
    const [activeSport, setActiveSport] = useState<SportFilter>('All');

    const filteredVenues =
        activeSport === 'All'
            ? venues.data
            : venues.data.filter((v) => {
                  const haystack = `${v.name} ${v.description ?? ''}`.toLowerCase();
                  return haystack.includes(activeSport.toLowerCase());
              });

    /* GSAP hero entrance */
    const heroRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!heroRef.current) return;

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const eyebrow = heroRef.current.querySelector<HTMLElement>('[data-hero-eyebrow]');
            const h1 = heroRef.current.querySelector<HTMLElement>('[data-hero-h1]');
            const sub = heroRef.current.querySelector<HTMLElement>('[data-hero-sub]');
            const form = heroRef.current.querySelector<HTMLElement>('[data-hero-form]');

            if (reduced) {
                gsap.set([eyebrow, h1, sub, form], { opacity: 1, y: 0 });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from(eyebrow, { opacity: 0, y: 12, duration: 0.5 }, 0.2)
                .from(h1, { opacity: 0, y: 22, duration: 0.65 }, 0.4)
                .from(sub, { opacity: 0, y: 18, duration: 0.6 }, 0.7)
                .from(form, { opacity: 0, y: 14, duration: 0.55 }, 0.9);
        },
        { scope: heroRef },
    );

    return (
        <>
            <Head title="Book a court in Iligan City — sportify.ph" />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative overflow-hidden"
                style={{ minHeight: 420, background: '#faf5ec' }}
            >
                {/* Faint diagonal court-line texture */}
                <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045]"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <pattern
                            id="court-lines"
                            x="0"
                            y="0"
                            width="64"
                            height="64"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(22)"
                        >
                            <line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="64"
                                stroke="#3e2817"
                                strokeWidth="1"
                            />
                            <line
                                x1="32"
                                y1="0"
                                x2="32"
                                y2="64"
                                stroke="#3e2817"
                                strokeWidth="0.5"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#court-lines)" />
                </svg>

                {/* Orange top-edge accent */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute top-0 right-0 h-[3px] w-1/2 bg-[#f37021]"
                />

                <div className="relative mx-auto w-full max-w-[1440px] px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-14">
                    <p
                        data-hero-eyebrow
                        className="mb-5 inline-block text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#5c3a21]"
                    >
                        Iligan City · Racquet Sports
                    </p>

                    <h1
                        data-hero-h1
                        className="mx-auto mb-6 max-w-2xl font-sans text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.97] tracking-[-0.04em] text-[#3e2817]"
                    >
                        Find your court<span className="text-[#f37021]">.</span>
                    </h1>

                    <p
                        data-hero-sub
                        className="mx-auto mb-10 max-w-[52ch] font-sans text-base leading-[1.75] text-[#5c3a21]"
                    >
                        Browse verified courts for Tennis, Pickleball, and Badminton in
                        Iligan City. Book in seconds.
                    </p>

                    {/* Search form — submits to /venues */}
                    <form
                        data-hero-form
                        onSubmit={handleSearch}
                        className="mx-auto grid max-w-2xl gap-3 border border-[#3e2817]/15 bg-white p-4 shadow-[0_8px_32px_-12px_rgba(62,40,23,0.18)] sm:grid-cols-[1.6fr_1fr_auto] sm:items-end sm:gap-4 sm:p-5"
                    >
                        <label className="block text-left">
                            <span className="mb-1.5 block text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#5c3a21]/70">
                                Search
                            </span>
                            <div className="relative">
                                <Search
                                    className="absolute top-1/2 left-0 size-[14px] -translate-y-1/2 text-[#5c3a21]/50"
                                    aria-hidden
                                />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Venue or area…"
                                    className="rounded-none border-0 border-b border-[#3e2817]/20 bg-transparent px-0 pl-6 font-sans text-sm text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/40 focus-visible:border-[#f37021] focus-visible:ring-0"
                                />
                            </div>
                        </label>

                        <label className="block text-left">
                            <span className="mb-1.5 block text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#5c3a21]/70">
                                City
                            </span>
                            <Select value={city} onValueChange={setCity}>
                                <SelectTrigger className="h-auto rounded-none border-0 border-b border-[#3e2817]/20 bg-transparent px-0 py-2 font-sans text-sm text-[#3e2817] shadow-none focus:ring-0 focus-visible:border-[#f37021] focus-visible:ring-0 [&>svg]:text-[#5c3a21]/50">
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
                        </label>

                        <Button
                            type="submit"
                            className="h-auto rounded-none bg-[#f37021] px-7 py-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white shadow-none hover:bg-[#d85a14]"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </section>

            {/* ── Featured Venues grid ─────────────────────────────── */}
            <section className="border-t border-[#3e2817]/12 bg-white">
                <div className="mx-auto w-full max-w-[1440px] px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
                    {/* Section header */}
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#5c3a21]/70">
                                The Directory
                            </p>
                            <h2 className="font-sans text-[clamp(1.6rem,3.5vw,2.4rem)] font-black leading-[1.08] tracking-[-0.03em] text-[#3e2817]">
                                Featured Venues{' '}
                                <span className="text-[#f37021]">
                                    ({venues.total} available)
                                </span>
                            </h2>
                        </div>

                        <Link
                            href="/venues"
                            className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3e2817] transition hover:text-[#f37021] sm:inline-flex"
                        >
                            Browse all venues
                            <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>

                    {/* Sport filter pills */}
                    <div
                        className="mb-8 flex flex-wrap gap-2"
                        role="group"
                        aria-label="Filter by sport"
                    >
                        {SPORT_FILTERS.map((sport) => (
                            <button
                                key={sport}
                                type="button"
                                onClick={() => setActiveSport(sport)}
                                className={cn(
                                    'rounded-none px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition',
                                    activeSport === sport
                                        ? 'bg-[#3e2817] text-[#faf5ec]'
                                        : 'border border-[#3e2817]/20 text-[#3e2817] hover:border-[#f37021]',
                                )}
                                aria-pressed={activeSport === sport}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    {filteredVenues.length === 0 ? (
                        <Card className="border-[#3e2817]/15 bg-[#faf5ec]">
                            <CardContent className="py-14 text-center font-sans text-[#5c3a21]">
                                No venues match this sport yet.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredVenues.map((venue) => (
                                <div key={venue.id}>
                                    <VenueCard venue={venue} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Browse all CTA below grid */}
                    <div className="mt-10 text-center">
                        <Link
                            href="/venues"
                            className="inline-flex items-center gap-2 border border-[#3e2817]/25 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3e2817] transition hover:border-[#f37021] hover:text-[#f37021]"
                        >
                            Browse all venues
                            <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────── */}
            <section className="bg-[#3e2817] text-[#faf5ec]">
                <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
                    <p className="mb-10 text-center text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[#faf5ec]/50">
                        How it works
                    </p>

                    <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
                        <HowItWorksStep
                            number="1"
                            title="Browse"
                            description="Pick a venue and sport. Filter by location or surface type."
                        />
                        <HowItWorksStep
                            number="2"
                            title="Choose a slot"
                            description="See real-time availability. Pick the time that works for you."
                        />
                        <HowItWorksStep
                            number="3"
                            title="Book"
                            description="Confirm in seconds, no phone calls. Your court is reserved."
                        />
                    </div>
                </div>
            </section>

            {/* ── For Venue Owners CTA ─────────────────────────────── */}
            <section className="bg-[#faf5ec]">
                <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
                    <div className="mx-auto max-w-xl text-center">
                        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[#5c3a21]/70">
                            For Venue Owners
                        </p>
                        <h2 className="mb-4 font-sans text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[1.08] tracking-[-0.03em] text-[#3e2817]">
                            Run a court worth{' '}
                            <span className="italic text-[#f37021]">discovering</span>?
                        </h2>
                        <p className="mb-8 font-sans text-base leading-relaxed text-[#5c3a21]">
                            List on sportify
                            <span className="italic text-[#f37021]">.ph</span> and connect
                            with players who take the game seriously.
                        </p>

                        {user ? (
                            <Link
                                href={dashboard().url}
                                className="inline-flex items-center gap-2 bg-[#3e2817] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                            >
                                Open dashboard
                                <ArrowRight className="size-3.5" aria-hidden />
                            </Link>
                        ) : (
                            canRegister && (
                                <Link
                                    href={`${register().url}?intent=venue_owner`}
                                    className="inline-flex items-center gap-2 bg-[#3e2817] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                >
                                    Apply as host
                                    <ArrowRight className="size-3.5" aria-hidden />
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

/* ── How It Works step ───────────────────────────────────────────── */
function HowItWorksStep({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col gap-3 border-t border-[#faf5ec]/15 pt-6">
            <span
                aria-hidden
                className="block font-sans text-[2.2rem] font-black leading-none tracking-[-0.04em] text-[#f37021]"
            >
                {number}
            </span>
            <h3 className="font-sans text-lg font-black tracking-[-0.02em] text-[#faf5ec]">
                {title}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-[#faf5ec]/70">
                {description}
            </p>
        </div>
    );
}
