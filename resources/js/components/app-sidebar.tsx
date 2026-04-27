import { Link, usePage } from '@inertiajs/react';
import {
    CalendarRange,
    LayoutGrid,
    MapPinned,
    ShieldCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as venuesIndex } from '@/routes/venues';
import { index as venueAdminIndex } from '@/routes/venue-admin/venues';
import type { NavItem, Role, User } from '@/types';

type SidebarSection = {
    label: string;
    items: NavItem[];
};

function buildSections(user: User | null): SidebarSection[] {
    if (!user) {
        return [];
    }

    const roles: Role[] = (user.roles ?? []) as Role[];
    const sections: SidebarSection[] = [];

    const isOwnerOrStaff =
        roles.includes('venue_owner') || roles.includes('venue_staff');
    const isAdmin = roles.includes('super_admin');

    sections.push({
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: dashboard().url, icon: LayoutGrid },
            { title: 'Browse venues', href: venuesIndex().url, icon: MapPinned },
        ],
    });

    // Player nav (everyone has access)
    sections.push({
        label: 'Play',
        items: [
            { title: 'My bookings', href: '/bookings', icon: CalendarRange },
            { title: 'Open play sessions', href: '/sessions', icon: UsersRound },
        ],
    });

    // Owner/staff: surface only the venues hub. Per-venue resources (courts,
    // sessions, bookings, payments, staff) are reachable via that hub so they
    // stay scoped to a specific venue — supports owners with multiple venues.
    if (isOwnerOrStaff || isAdmin) {
        sections.push({
            label: 'Manage venue',
            items: [
                {
                    title: 'My venues',
                    href: venueAdminIndex().url,
                    icon: MapPinned,
                },
            ],
        });
    }

    if (isAdmin) {
        sections.push({
            label: 'Super admin',
            items: [
                {
                    title: 'Venue approvals',
                    href: '/admin/venues',
                    icon: ShieldCheck,
                },
                { title: 'Users', href: '/admin/users', icon: Users },
            ],
        });
    }

    return sections;
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user;

    const sections = useMemo(() => buildSections(user), [user]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {sections.map((section) => (
                    <NavMain
                        key={section.label}
                        label={section.label}
                        items={section.items}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
