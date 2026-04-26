import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dashboard, home, login, register } from '@/routes';
import type { User } from '@/types';

type Props = {
    children: ReactNode;
    className?: string;
};

export default function PublicLayout({ children, className }: Props) {
    const { auth } = usePage().props;
    const user = (auth as { user: User | null }).user;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="border-b border-[#3e2817]/10 bg-[#faf5ec]/85 backdrop-blur-sm">
                <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
                    <Link
                        href={home().url}
                        className="flex items-center"
                        aria-label="sportify.ph — home"
                    >
                        <SportifyWordmark />
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        <NavLink href="/venues">Venues</NavLink>
                        <NavLink href="/#membership">Membership</NavLink>
                        <NavLink href="/#hosts">For Hosts</NavLink>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <Link
                                href={dashboard().url}
                                className="inline-flex items-center justify-center border border-[#3e2817] bg-[#3e2817] px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login().url}
                                    className="hidden items-center px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#3e2817]/80 transition hover:text-[#3e2817] sm:inline-flex"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register().url}
                                    className="inline-flex items-center justify-center border border-[#3e2817] bg-[#3e2817] px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#faf5ec] transition hover:bg-[#2a1a0e]"
                                >
                                    Become a member
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className={cn('w-full flex-1', className)}>{children}</main>

            <footer className="border-t border-[#3e2817]/15 bg-[#faf5ec]">
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
                            <p className="max-w-xs font-serif text-sm leading-relaxed text-[#5c3a21]">
                                A members&#8209;club for racquet sports in the
                                Philippines. Reserve courts. Meet players.
                                Play beautifully.
                            </p>
                        </div>

                        <FooterColumn title="The Club">
                            <FooterLink href="/venues">Venues</FooterLink>
                            <FooterLink href="/#membership">Membership</FooterLink>
                            <FooterLink href="/#sports">Sports</FooterLink>
                        </FooterColumn>

                        <FooterColumn title="For Hosts">
                            <FooterLink href={register().url}>List your venue</FooterLink>
                            <FooterLink href="/#hosts">Partner with us</FooterLink>
                        </FooterColumn>

                        <FooterColumn title="Account">
                            <FooterLink href={login().url}>Log in</FooterLink>
                            <FooterLink href={register().url}>Sign up</FooterLink>
                        </FooterColumn>
                    </div>

                    <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#3e2817]/12 pt-6 text-xs text-[#5c3a21] sm:flex-row sm:items-center">
                        <p className="tracking-[0.12em]">
                            &copy; {new Date().getFullYear()} sportify
                            <span className="italic text-[#f37021]">.ph</span> —
                            Manila, Philippines
                        </p>
                        <p className="tracking-[0.18em] uppercase">
                            Tennis · Pickleball · Badminton
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="px-3 py-2 text-xs font-medium uppercase tracking-[0.22em] text-[#3e2817]/75 transition hover:text-[#f37021]"
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
                className="text-[#3e2817] transition hover:text-[#f37021]"
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
