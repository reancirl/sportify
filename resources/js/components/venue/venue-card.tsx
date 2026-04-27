import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type VenueWithListingExtras = Models.Venue & {
    courts_count?: number;
    courts_min_hourly_rate?: string | number | null;
};

type Props = {
    venue: VenueWithListingExtras;
    href?: string;
};

export function VenueCard({ venue, href }: Props) {
    const targetHref = href ?? `/venues/${venue.slug}`;
    const cover = venue.images?.[0]?.image_path ?? venue.cover_image_path ?? null;
    const courtsCount = venue.courts_count ?? venue.courts?.length ?? 0;
    const minRate = venue.courts_min_hourly_rate;

    return (
        <Link
            href={targetHref}
            className="group flex h-full flex-col border border-[#3e2817]/22 bg-white shadow-[0_4px_20px_-8px_rgba(62,40,23,0.1)] transition hover:border-[#3e2817]/35 hover:shadow-[0_20px_40px_-16px_rgba(62,40,23,0.28)]"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#efe6d4]">
                {cover ? (
                    <img
                        src={cover}
                        alt={`${venue.name} cover photo`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#efe6d4]">
                        <MapPin
                            className="size-10 text-[#5c3a21]/35"
                            aria-hidden
                        />
                    </div>
                )}

                {venue.status === 'approved' && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-[#faf5ec]/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#3e2817] backdrop-blur">
                        <CheckCircle2
                            className="size-3 text-[#f37021]"
                            aria-hidden
                        />
                        Verified
                    </span>
                )}

                {minRate !== null && minRate !== undefined && (
                    <div className="absolute right-4 bottom-4 bg-[#3e2817] px-3 py-1.5 font-display text-sm font-semibold text-[#faf5ec]">
                        from {formatPHP(minRate)}
                        <span className="text-[10px] font-normal tracking-[0.18em] text-[#faf5ec]/70">
                            {' '}
                            / HR
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="space-y-1.5">
                    <p className="editorial-label">
                        {venue.city}
                    </p>
                    <h3 className="line-clamp-1 font-display text-xl font-bold leading-tight tracking-[-0.01em] text-[#3e2817]">
                        {venue.name}
                    </h3>
                    <p className="flex items-center gap-1.5 font-serif text-sm text-[#5c3a21]">
                        <MapPin className="size-3.5" aria-hidden />
                        {venue.city}, {venue.province}
                    </p>
                </div>

                {venue.description && (
                    <p className="line-clamp-2 font-serif text-sm leading-relaxed text-[#5c3a21]">
                        {venue.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-[#3e2817]/12 pt-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#5c3a21]">
                        {courtsCount} {courtsCount === 1 ? 'court' : 'courts'}
                    </p>
                    <span className="inline-flex items-center gap-1.5 border border-[#3e2817]/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#3e2817] transition group-hover:border-[#f37021]/40 group-hover:text-[#f37021]">
                        View &amp; book
                        <ArrowRight className="size-3" aria-hidden />
                    </span>
                </div>
            </div>
        </Link>
    );
}
