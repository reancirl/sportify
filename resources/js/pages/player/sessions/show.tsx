import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { JoinSessionDialog } from '@/components/session/join-session-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInManila, formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    session: Models.OpenPlaySession;
    is_joined: boolean;
};

export default function PlayerSessionsShow({ session, is_joined }: Props) {
    const playersCount = session.players_count ?? session.players?.length ?? 0;
    const isFull = playersCount >= session.max_players;

    return (
        <>
            <Head title={session.title} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={session.title}
                    description={session.venue?.name ?? undefined}
                />

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <CardTitle>Session details</CardTitle>
                        <Badge variant="outline">{session.status.replace('_', ' ')}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {session.description && (
                            <p className="text-muted-foreground">{session.description}</p>
                        )}
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
                        <p>
                            <span className="text-muted-foreground">Fee:</span>{' '}
                            <span className="font-medium">
                                {formatPHP(session.fee_per_player)}
                            </span>
                        </p>
                        {session.min_skill_level && (
                            <p>
                                <span className="text-muted-foreground">Skill range:</span>{' '}
                                {session.min_skill_level}
                                {session.max_skill_level && ` – ${session.max_skill_level}`}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    {is_joined ? (
                        <Button disabled variant="secondary">
                            You are registered
                        </Button>
                    ) : isFull ? (
                        <Button disabled variant="outline">
                            Session is full
                        </Button>
                    ) : (
                        <JoinSessionDialog
                            session={session}
                            trigger={<Button>Join session</Button>}
                        />
                    )}
                </div>

                {session.players && session.players.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Players ({playersCount})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {session.players.map((player) => (
                                    <li
                                        key={player.id}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <span>{player.user?.name ?? `Player #${player.user_id}`}</span>
                                        <Badge variant="outline">{player.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
