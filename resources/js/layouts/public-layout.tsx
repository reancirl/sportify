import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dashboard, home, login, register } from '@/routes';
import { index as venuesIndex } from '@/routes/venues';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function PublicLayout({ children, className }: Props) {
    const { auth, sportify } = usePage().props;
    const user = auth.user;
    const { sports } = sportify;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="border-b border-chocolate/10 bg-cream/85 backdrop-blur-sm">
                <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
                    <Link
                        href={home().url}
                        className="flex items-center"
                        aria-label="sportify.ph — home"
                    >
                        <SportifyWordmark />
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        <NavLink href={venuesIndex().url} prefetch>Venues</NavLink>
                        <NavLink href="/club#membership">Membership</NavLink>
                        <NavLink href="/club#hosts">For Hosts</NavLink>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <Link
                                prefetch
                                href={dashboard().url}
                                className="inline-flex items-center justify-center border border-chocolate bg-chocolate px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cream transition hover:bg-chocolate-deep"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    prefetch
                                    href={login().url}
                                    className="hidden items-center px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-chocolate/80 transition hover:text-chocolate sm:inline-flex"
                                >
                                    Log in
                                </Link>
                                <Link
                                    prefetch
                                    href={register().url}
                                    className="inline-flex items-center justify-center border border-chocolate bg-chocolate px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cream transition hover:bg-chocolate-deep"
                                >
                                    Become a member
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className={cn('w-full flex-1', className)}>{children}</main>

            <footer className="border-t border-chocolate/15 bg-cream">
                <div className="mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 lg:px-14">
                    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                        <div className="space-y-4">
                            <Link
                                href={home().url}
                                className="inline-block"
                                aria-label="sportify.ph"
                            >
                                <SportifyWordmark className="h-11 w-auto" />
                            </Link>
                            <p className="max-w-xs font-serif text-sm leading-relaxed text-chocolate-soft">
                                A members&#8209;club for racquet sports in the
                                Philippines. Reserve courts. Meet players.
                                Play beautifully.
                            </p>
                        </div>

                        <FooterColumn title="The Club">
                            <FooterLink href={venuesIndex().url}>Venues</FooterLink>
                            <FooterLink href="/club#membership">Membership</FooterLink>
                            <FooterLink href="/club#sports">Sports</FooterLink>
                        </FooterColumn>

                        <FooterColumn title="For Hosts">
                            <FooterLink href={register().url}>List your venue</FooterLink>
                            <FooterLink href="/club#hosts">Partner with us</FooterLink>
                        </FooterColumn>

                        <FooterColumn title="Account">
                            <FooterLink href={login().url}>Log in</FooterLink>
                            <FooterLink href={register().url}>Sign up</FooterLink>
                        </FooterColumn>
                    </div>

                    <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-chocolate/12 pt-6 text-xs text-chocolate-soft sm:flex-row sm:items-center">
                        <p className="tracking-[0.12em]">
                            &copy; {new Date().getFullYear()} sportify
                            <span className="italic text-hermes">.ph</span> —
                            Manila, Philippines
                        </p>
                        <p className="tracking-[0.18em] uppercase">
                            {sports.map((s) => s.name).join(' · ')}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({
    href,
    children,
    prefetch,
}: {
    href: string;
    children: ReactNode;
    prefetch?: boolean;
}) {
    return (
        <Link
            href={href}
            prefetch={prefetch}
            className="px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-chocolate/75 transition hover:text-hermes"
        >
            {children}
        </Link>
    );
}

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div>
            <p className="editorial-label mb-4">{title}</p>
            <ul className="space-y-2 font-serif text-sm">{children}</ul>
        </div>
    );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <li>
            <Link
                href={href}
                className="text-chocolate transition hover:text-hermes"
            >
                {children}
            </Link>
        </li>
    );
}

function SportifyWordmark({ className }: { className?: string }) {
    return (
        <img
            src="/logo/sportify-logo-horizontal.svg"
            alt="sportify.ph"
            className={cn('h-11 w-auto select-none', className)}
            draggable={false}
        />
    );
}
