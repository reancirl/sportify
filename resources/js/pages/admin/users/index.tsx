import { Head, router } from '@inertiajs/react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { PaginationNav } from '@/components/pagination-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn, formatInManila } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    users: Models.PaginatedResponse<Models.User>;
    filters: {
        search: string | null;
    };
};

const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super admin',
    venue_owner: 'Venue owner',
    venue_staff: 'Venue staff',
    player: 'Player',
};

export default function AdminUsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/admin/users',
            { search: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Users" />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <header className="flex flex-col gap-4 border-b border-[#3e2817]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                            <UsersIcon className="size-3.5 text-[#f37021]" />
                            Super admin
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-[-0.01em] text-[#3e2817]">
                            Users
                        </h1>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            Search and review platform members.
                        </p>
                    </div>

                    <div className="flex flex-col rounded-md border border-[#3e2817]/15 bg-white px-4 py-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5c3a21]">
                            Total members
                        </span>
                        <span className="font-display text-xl font-bold text-[#3e2817]">
                            {users.total}
                        </span>
                    </div>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-wrap items-center gap-3"
                >
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search
                            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#5c3a21]/55"
                            aria-hidden
                        />
                        <Input
                            id="user-search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or email"
                            className="h-9 rounded-md border-[#3e2817]/20 bg-white pl-9 text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="h-9 rounded-md bg-[#3e2817] px-5 text-xs font-medium uppercase tracking-[0.18em] text-[#faf5ec] shadow-none hover:bg-chocolate-deep"
                    >
                        Search
                    </Button>
                </form>

                {users.data.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[#3e2817]/20 bg-white py-16 text-center">
                        <p className="font-serif text-sm text-[#5c3a21]">
                            No users found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-[#3e2817]/15 bg-white shadow-[0_1px_2px_rgba(62,40,23,0.04)]">
                        <Table>
                            <TableHeader className="bg-[#faf5ec]">
                                <TableRow className="border-[#3e2817]/12 hover:bg-[#faf5ec]">
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Roles</Th>
                                    <Th>Joined</Th>
                                    <Th>Status</Th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="border-[#3e2817]/10 transition-colors hover:bg-[#faf5ec]/60"
                                    >
                                        <TableCell className="px-4 py-4">
                                            <p className="font-display text-sm font-semibold text-[#3e2817]">
                                                {user.name}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#3e2817]">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.roles ?? []).map(
                                                    (role) => (
                                                        <span
                                                            key={role}
                                                            className="inline-flex items-center rounded-full border border-[#3e2817]/20 bg-[#faf5ec] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#3e2817]"
                                                        >
                                                            {ROLE_LABEL[role] ??
                                                                role}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-sm text-[#5c3a21]">
                                            {formatInManila(user.created_at)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset',
                                                    user.is_active
                                                        ? 'bg-[#dcfce7] text-[#166534] ring-[#166534]/25'
                                                        : 'bg-[#fee2e2] text-[#991b1b] ring-[#991b1b]/25',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'size-1.5 rounded-full',
                                                        user.is_active
                                                            ? 'bg-[#16a34a]'
                                                            : 'bg-[#dc2626]',
                                                    )}
                                                />
                                                {user.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <PaginationNav paginated={users} />
            </div>
        </>
    );
}

function Th({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <TableHead
            className={cn(
                'h-11 px-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5c3a21]',
                className,
            )}
        >
            {children}
        </TableHead>
    );
}
