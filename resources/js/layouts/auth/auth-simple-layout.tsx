import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh w-full bg-[#faf5ec] lg:grid-cols-[1.05fr_1fr]">
            {/* — — — Brand panel (left) — — — */}
            <aside className="relative hidden overflow-hidden bg-[#3e2817] text-[#faf5ec] lg:flex lg:flex-col lg:justify-between lg:p-14">
                <BrandOrnament />

                <Link
                    href={home().url}
                    className="relative z-10 inline-flex w-fit items-center"
                    aria-label="sportify.ph"
                >
                    <SportifyWordmarkLight className="h-10 w-auto" />
                </Link>

                <div className="relative z-10 max-w-md space-y-8">
                    <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#faf5ec]/65">
                        Members access
                    </p>
                    <p className="font-display text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em]">
                        “The most luxurious thing we offer is the absence of{' '}
                        <span className="italic text-[#f37021]">
                            friction
                        </span>
                        .”
                    </p>
                    <p className="font-serif text-base leading-relaxed text-[#faf5ec]/75">
                        Reserve premium courts. Discover open play. Meet
                        players who take the game seriously — across Iligan
                        City and beyond.
                    </p>
                </div>

                <div className="relative z-10 flex items-end justify-between gap-6 text-[10px] uppercase tracking-[0.28em] text-[#faf5ec]/55">
                    <span>Tennis · Pickleball · Badminton</span>
                    <span>
                        sportify
                        <span className="italic text-[#f37021]">.ph</span>
                    </span>
                </div>
            </aside>

            {/* — — — Form panel (right) — — — */}
            <main className="relative flex min-h-svh flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14">
                <div className="flex items-center justify-between">
                    <Link
                        href={home().url}
                        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21] transition hover:text-[#f37021] lg:hidden"
                        aria-label="sportify.ph home"
                    >
                        <img
                            src="/logo/sportify-logo-horizontal.svg"
                            alt="sportify.ph"
                            className="h-9 w-auto select-none"
                            draggable={false}
                        />
                    </Link>
                    <Link
                        href={home().url}
                        className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21] transition hover:text-[#f37021]"
                    >
                        <ArrowLeft className="size-3" aria-hidden />
                        Back to site
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <header className="mb-10 space-y-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#5c3a21]">
                                Members access
                            </p>
                            <h1 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[#3e2817]">
                                {title}
                                <span className="text-[#f37021]">.</span>
                            </h1>
                            {description && (
                                <p className="font-serif text-base leading-relaxed text-[#5c3a21]">
                                    {description}
                                </p>
                            )}
                        </header>

                        {children}
                    </div>
                </div>

                <p className="mt-10 text-[10px] uppercase tracking-[0.22em] text-[#5c3a21]/70">
                    &copy; {new Date().getFullYear()} sportify
                    <span className="italic text-[#f37021]">.ph</span> ·
                    Iligan City, Philippines
                </p>
            </main>
        </div>
    );
}

/**
 * Light-on-dark variant of the horizontal sportify logo for use on the
 * chocolate brand panel. Mirrors the artwork in
 * `/public/logo/sportify-logo-horizontal.svg` but swaps the chocolate
 * wordmark to cream while keeping the orange `.ph` and the orange court mark.
 */
function SportifyWordmarkLight({ className }: { className?: string }) {
    return (
        <svg
            viewBox="15 32 320 80"
            preserveAspectRatio="xMinYMid meet"
            role="img"
            aria-label="sportify.ph"
            className={className}
        >
            <g transform="translate(20 40)">
                <rect x="0" y="0" width="60" height="40" fill="#F37021" />
                <line
                    x1="0"
                    y1="20"
                    x2="60"
                    y2="20"
                    stroke="#FAF5EC"
                    strokeWidth="1.5"
                />
                <line
                    x1="30"
                    y1="0"
                    x2="30"
                    y2="40"
                    stroke="#FAF5EC"
                    strokeWidth="0.6"
                    strokeDasharray="2,2"
                />
                <rect
                    x="12"
                    y="8"
                    width="36"
                    height="24"
                    fill="none"
                    stroke="#FAF5EC"
                    strokeWidth="0.6"
                />
            </g>
            <text
                x="95"
                y="73"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="42"
                fontWeight="700"
                fill="#FAF5EC"
                letterSpacing="-1"
            >
                sportify
            </text>
            <text
                x="95"
                y="100"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="20"
                fontStyle="italic"
                fill="#F37021"
                letterSpacing="1"
            >
                .ph
            </text>
        </svg>
    );
}

function BrandOrnament() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-24 h-[640px] w-[640px] opacity-[0.08]"
            viewBox="0 0 200 200"
            fill="none"
        >
            <rect
                x="10"
                y="10"
                width="180"
                height="180"
                stroke="#FAF5EC"
                strokeWidth="0.5"
            />
            <line
                x1="10"
                y1="100"
                x2="190"
                y2="100"
                stroke="#FAF5EC"
                strokeWidth="0.5"
            />
            <line
                x1="100"
                y1="10"
                x2="100"
                y2="190"
                stroke="#FAF5EC"
                strokeWidth="0.5"
                strokeDasharray="2 3"
            />
            <rect
                x="40"
                y="40"
                width="120"
                height="120"
                stroke="#F37021"
                strokeWidth="0.6"
            />
        </svg>
    );
}
