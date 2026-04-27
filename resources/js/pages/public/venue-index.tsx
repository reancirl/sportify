import { Head, router } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { useTilt3D } from '@/hooks/use-tilt-3d';
import type { Models } from '@/types';

gsap.registerPlugin(ScrollTrigger, SplitText);

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
};

export default function PublicVenueIndex({ venues, cities, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [city, setCity] = useState<string>(filters.city ?? 'all');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/venues',
            {
                search: search || undefined,
                city: city === 'all' ? undefined : city,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const headerRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduce) return;

            const labelEl = headerRef.current?.querySelector<HTMLElement>('[data-label]');
            const h1El = headerRef.current?.querySelector<HTMLElement>('[data-h1]');
            const subEl = headerRef.current?.querySelector<HTMLElement>('[data-sub]');

            if (!h1El) return;

            const split = new SplitText(h1El, { type: 'chars' });

            const tl = gsap.timeline();

            if (labelEl) {
                tl.from(labelEl, { opacity: 0, y: 10, duration: 0.5 }, 0.2);
            }

            tl.from(
                split.chars,
                {
                    opacity: 0,
                    rotateX: -80,
                    y: 20,
                    duration: 0.65,
                    stagger: { amount: 0.65, from: 'start' },
                    transformOrigin: '50% 100%',
                    transformPerspective: 700,
                },
                0.4,
            );

            if (subEl) {
                tl.from(subEl, { opacity: 0, y: 16, duration: 0.6 }, 1.0);
            }

            return () => split.revert();
        },
        { scope: headerRef },
    );

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;

        const cards = grid.querySelectorAll<HTMLElement>('[data-card]');
        if (cards.length === 0) return;

        gsap.set(cards, { opacity: 0, y: 36 });

        ScrollTrigger.batch(cards, {
            onEnter: (batch) =>
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: 0.75,
                    ease: 'power3.out',
                    stagger: 0.09,
                    overwrite: true,
                }),
            start: 'top 88%',
            once: true,
        });

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [venues.data]);

    return (
        <>
            <Head title="Venues in Iligan City" />

            {/* Dark header */}
            <header
                ref={headerRef}
                className="relative overflow-hidden bg-[#3e2817] px-6 py-16 sm:px-10 sm:py-20 lg:px-14"
            >
                {/* Decorative circles */}
                <div
                    className="pointer-events-none absolute -top-24 -right-24 size-[380px] rounded-full border border-[#faf5ec]/8"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -top-8 -right-8 size-[240px] rounded-full border border-[#faf5ec]/10"
                    aria-hidden
                />

                <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-4">
                    <p
                        data-label
                        className="editorial-label text-[#faf5ec]/55"
                    >
                        The Directory · Iligan City
                    </p>
                    <h1
                        data-h1
                        className="font-sans text-[clamp(2.4rem,5.5vw,4.2rem)] font-black leading-[1.02] tracking-[-0.04em] text-[#faf5ec]"
                    >
                        Racquet sport venues in Iligan City
                        <span className="text-[#f37021]">.</span>
                    </h1>
                    <p
                        data-sub
                        className="max-w-2xl font-serif text-base leading-relaxed text-[#faf5ec]/70"
                    >
                        {venues.total}{' '}
                        {venues.total === 1 ? 'venue' : 'venues'} hand-vetted
                        for surface quality, atmosphere, and the kind of game
                        that brings members back.
                    </p>
                </div>
            </header>

            {/* Accent line */}
            <div className="h-[3px] w-full bg-[#f37021]" aria-hidden />

            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 border border-[#3e2817]/20 bg-white p-5 shadow-[0_4px_24px_-8px_rgba(62,40,23,0.12)] sm:grid-cols-[1.5fr_1fr_auto] sm:items-end sm:gap-5 sm:p-6"
                >
                    <label className="block">
                        <span className="editorial-label mb-2 block">
                            Search
                        </span>
                        <div className="relative">
                            <Search
                                className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-[#5c3a21]/60"
                                aria-hidden
                            />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Venue or area — e.g. Pala-o, Tibanga, Suarez"
                                className="rounded-none border-0 border-b border-[#3e2817]/25 bg-transparent px-0 pl-7 font-serif text-base text-[#3e2817] shadow-none placeholder:text-[#5c3a21]/45 focus-visible:border-[#f37021] focus-visible:ring-0"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="editorial-label mb-2 block">
                            City
                        </span>
                        <Select value={city} onValueChange={setCity}>
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
                    </label>

                    <Button
                        type="submit"
                        className="h-auto rounded-none bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#2a1a0e]"
                    >
                        Apply
                    </Button>
                </form>

                {venues.data.length === 0 ? (
                    <Card className="border-[#3e2817]/15 bg-white">
                        <CardContent className="py-14 text-center font-serif text-[#5c3a21]">
                            No venues match your search.
                        </CardContent>
                    </Card>
                ) : (
                    <div
                        ref={gridRef}
                        className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
                        style={{ perspective: '1200px' }}
                    >
                        {venues.data.map((venue) => (
                            <div data-card key={venue.id}>
                                <Tilt3D className="h-full">
                                    <VenueCard venue={venue} />
                                </Tilt3D>
                            </div>
                        ))}
                    </div>
                )}

                <PaginationNav paginated={venues} />
            </div>
        </>
    );
}

function Tilt3D({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useTilt3D<HTMLDivElement>({ intensityX: 4, intensityY: 6, hoverScale: 1.015 });
    return (
        <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
            {children}
        </div>
    );
}
