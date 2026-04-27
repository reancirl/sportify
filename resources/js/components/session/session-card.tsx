import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    session: Models.OpenPlaySession;
};

const STATUS_VARIANT: Record<Models.SessionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'default',
    full: 'secondary',
    in_progress: 'default',
    completed: 'outline',
    cancelled: 'destructive',
};

export function SessionCard({ session }: Props) {
    const venueName = session.venue?.name;
    const playersCount = session.players_count ?? session.players?.length ?? 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    {venueName && (
                        <span className="text-sm text-muted-foreground">{venueName}</span>
                    )}
                </div>
                <Badge variant={STATUS_VARIANT[session.status]}>
                    {session.status.replace('_', ' ')}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p>
                    <span className="text-muted-foreground">Starts:</span>{' '}
                    {formatInManila(session.starts_at)}
                </p>
                <p>
                    <span className="text-muted-foreground">Ends:</span>{' '}
                    {formatInManila(session.ends_at)}
                </p>
                <p>
                    <span className="text-muted-foreground">Players:</span>{' '}
                    {playersCount} / {session.max_players}
                </p>
                <p className="font-medium">
                    Fee: {formatPHP(session.fee_per_player)}
                </p>
            </CardContent>
            <CardFooter>
                <Link
                    href={`/sessions/${session.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    View details
                </Link>
            </CardFooter>
        </Card>
    );
}
