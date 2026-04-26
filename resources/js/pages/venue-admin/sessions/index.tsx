import { Head, Link } from '@inertiajs/react';
import { PaginationNav } from '@/components/pagination-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
    sessions: Models.PaginatedResponse<Models.OpenPlaySession>;
};

export default function VenueAdminSessionsIndex({ venue, sessions }: Props) {
    return (
        <>
            <Head title={`${venue.name} — sessions`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <div className="flex items-end justify-between">
                    <p className="font-serif text-sm text-[#5c3a21]">
                        Manage open play sessions for this venue.
                    </p>
                    <Button asChild>
                        <Link
                            href={`/venue-admin/venues/${venue.id}/sessions/create`}
                        >
                            New session
                        </Link>
                    </Button>
                </div>

                {sessions.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Venue</TableHead>
                                    <TableHead>Starts</TableHead>
                                    <TableHead>Players</TableHead>
                                    <TableHead>Fee</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.data.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell className="font-medium">
                                            {session.title}
                                        </TableCell>
                                        <TableCell>{session.venue?.name ?? '—'}</TableCell>
                                        <TableCell>{formatInManila(session.starts_at)}</TableCell>
                                        <TableCell>
                                            {(session.players_count ?? 0)} / {session.max_players}
                                        </TableCell>
                                        <TableCell>{formatPHP(session.fee_per_player)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {session.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <PaginationNav paginated={sessions} />
            </div>
        </>
    );
}
