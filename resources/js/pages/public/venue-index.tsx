import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
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
};

export default function PublicVenueIndex({ venues, cities, filters }: Props) {
    const { sportify } = usePage().props;
    const { region } = sportify;

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

    const headerRef = useReveal<HTMLElement>({
        scroll: false,
        stagger: 0.08,
        y: 22,
    });
    const gridRef = useReveal<HTMLDivElement>({ stagger: 0.06, y: 24 });

    return (
        <>
            <Head title={`Venues in ${region.city}`}>
                <meta
                    name="description"
                    content={`Browse hand-vetted racquet sport venues in ${region.city}. Find courts for tennis, pickleball, badminton, and more.`}
                />
            </Head>

            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
                <header
                    ref={headerRef}
                    className="flex flex-col gap-4 border-b border-chocolate/15 pb-10"
                >
                    <p data-reveal className="editorial-label">
                        The Directory · {region.city}
                    </p>
                    <h1
                        data-reveal
                        className="font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.02em] text-chocolate"
                    >
                        Racquet sport venues in {region.city}
                        <span className="text-hermes">.</span>
                    </h1>
                    <p
                        data-reveal
                        className="max-w-2xl font-serif text-base leading-relaxed text-chocolate-soft"
                    >
                        {venues.total}{' '}
                        {venues.total === 1 ? 'venue' : 'venues'} hand-vetted
                        for surface quality, atmosphere, and the kind of game
                        that brings members back.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-4 border border-chocolate/15 bg-white p-5 sm:grid-cols-[1.5fr_1fr_auto] sm:items-end sm:gap-5 sm:p-6"
                >
                    <label className="block">
                        <span className="editorial-label mb-2 block">
                            Search
                        </span>
                        <div className="relative">
                            <Search
                                className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-chocolate-soft/60"
                                aria-hidden
                            />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Venue or area — e.g. ${region.sample_areas.join(', ')}`}
                                className="rounded-none border-0 border-b border-chocolate/25 bg-transparent px-0 pl-7 font-serif text-base text-chocolate shadow-none placeholder:text-chocolate-soft/45 focus-visible:border-hermes focus-visible:ring-0"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="editorial-label mb-2 block">
                            City
                        </span>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="h-auto rounded-none border-0 border-b border-chocolate/25 bg-transparent px-0 py-2 font-serif text-base text-chocolate shadow-none focus:ring-0 focus-visible:border-hermes focus-visible:ring-0 [&>svg]:text-chocolate-soft/60">
                                <SelectValue placeholder={region.city} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All of {region.short_city}</SelectItem>
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
                        className="h-auto rounded-none bg-chocolate px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream shadow-none hover:bg-chocolate-deep"
                    >
                        Apply
                    </Button>
                </form>

                {venues.data.length === 0 ? (
                    <Card className="border-chocolate/15 bg-white">
                        <CardContent className="py-14 text-center font-serif text-chocolate-soft">
                            No venues match your search.
                        </CardContent>
                    </Card>
                ) : (
                    <div
                        ref={gridRef}
                        className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {venues.data.map((venue) => (
                            <div data-reveal key={venue.id}>
                                <VenueCard venue={venue} />
                            </div>
                        ))}
                    </div>
                )}

                <PaginationNav paginated={venues} />
            </div>
        </>
    );
}
