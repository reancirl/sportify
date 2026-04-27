import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin } from 'lucide-react';
import { formatInManila, formatPHP } from '@/lib/utils';

type Props = {
    booking: {
        id: string;
        starts_at: string | null;
        ends_at: string | null;
        total_amount: string;
        status: string;
        guest_name: string | null;
        guest_email: string | null;
        guest_phone: string | null;
        court: { id: string; name: string } | null;
        venue: {
            id: string;
            name: string;
            slug: string;
            city: string;
            contact_email: string | null;
            contact_phone: string | null;
        } | null;
        payment: {
            id: string;
            status: string;
            reference_number: string | null;
        } | null;
    };
};

export default function CheckoutSuccess({ booking }: Props) {
    const venue = booking.venue;
    const court = booking.court;

    return (
        <>
            <Head title="Booking submitted" />

            <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
                <div className="flex flex-col items-center gap-4 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-[#dcfce7] text-[#166534]">
                        <CheckCircle2 className="size-7" aria-hidden />
                    </span>
                    <p className="editorial-label">Booking received</p>
                    <h1 className="font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[#3e2817]">
                        Thank you, {booking.guest_name ?? 'friend'}
                        <span className="text-[#f37021]">.</span>
                    </h1>
                    <p className="max-w-lg font-serif text-base leading-relaxed text-[#5c3a21]">
                        We've received your booking and payment proof. The
                        venue will verify your payment and confirm shortly. A
                        confirmation will be sent to{' '}
                        <span className="font-semibold text-[#3e2817]">
                            {booking.guest_email}
                        </span>
                        .
                    </p>
                </div>

                <div className="overflow-hidden rounded-md border border-[#3e2817]/15 bg-white">
                    <div className="border-b border-[#3e2817]/12 px-6 py-4">
                        <p className="editorial-label">Reservation details</p>
                    </div>
                    <dl className="divide-y divide-[#3e2817]/10">
                        <Row
                            label="Reference"
                            value={
                                <span className="font-mono text-xs">
                                    {booking.id.split('-')[0]?.toUpperCase()}
                                </span>
                            }
                        />
                        <Row
                            label="Status"
                            value={
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#854d0e] ring-1 ring-inset ring-[#854d0e]/20">
                                    Pending verification
                                </span>
                            }
                        />
                        {venue && (
                            <Row
                                label="Venue"
                                value={
                                    <Link
                                        href={`/venues/${venue.slug}`}
                                        className="font-display font-semibold text-[#3e2817] hover:text-[#f37021]"
                                    >
                                        {venue.name}
                                    </Link>
                                }
                            />
                        )}
                        {court && <Row label="Court" value={court.name} />}
                        {booking.starts_at && (
                            <Row
                                label="Date & time"
                                value={`${formatInManila(booking.starts_at, 'PPp')}${
                                    booking.ends_at
                                        ? ' – ' + formatInManila(booking.ends_at, 'p')
                                        : ''
                                }`}
                            />
                        )}
                        <Row
                            label="Total"
                            value={
                                <span className="font-display text-lg font-bold text-[#3e2817]">
                                    {formatPHP(booking.total_amount)}
                                </span>
                            }
                        />
                        {booking.payment?.reference_number && (
                            <Row
                                label="GCash reference"
                                value={booking.payment.reference_number}
                            />
                        )}
                    </dl>
                </div>

                {venue && (
                    <div className="rounded-md border border-[#3e2817]/15 bg-[#faf5ec]/60 p-5">
                        <p className="editorial-label">Need help?</p>
                        <p className="mt-2 font-serif text-sm text-[#5c3a21]">
                            Contact{' '}
                            <span className="font-semibold text-[#3e2817]">
                                {venue.name}
                            </span>{' '}
                            directly:
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-[#3e2817]">
                            {venue.contact_email && (
                                <li className="flex items-center gap-2">
                                    <Mail
                                        className="size-3.5 text-[#5c3a21]"
                                        aria-hidden
                                    />
                                    <a
                                        href={`mailto:${venue.contact_email}`}
                                        className="hover:text-[#f37021]"
                                    >
                                        {venue.contact_email}
                                    </a>
                                </li>
                            )}
                            {venue.contact_phone && (
                                <li className="flex items-center gap-2">
                                    <Clock
                                        className="size-3.5 text-[#5c3a21]"
                                        aria-hidden
                                    />
                                    {venue.contact_phone}
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <MapPin
                                    className="size-3.5 text-[#5c3a21]"
                                    aria-hidden
                                />
                                {venue.city}
                            </li>
                        </ul>
                    </div>
                )}

                <div className="flex flex-col items-center gap-3">
                    <Link
                        href="/venues"
                        className="inline-flex items-center gap-2 bg-[#3e2817] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                    >
                        Browse more venues
                        <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/65">
                        Save this page or check your email for the booking link
                    </p>
                </div>
            </div>
        </>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 px-6 py-3.5">
            <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                {label}
            </dt>
            <dd className="text-right text-sm text-[#3e2817]">{value}</dd>
        </div>
    );
}
