import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PaginationNav } from '@/components/pagination-nav';
import { SessionCard } from '@/components/session/session-card';
import type { Models } from '@/types';

type Props = {
    sessions: Models.PaginatedResponse<Models.OpenPlaySession>;
};

export default function PlayerSessionsIndex({ sessions }: Props) {
    return (
        <>
            <Head title="Open play sessions" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Open play sessions"
                    description="Find and join open play sessions near you."
                />

                {sessions.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No upcoming sessions found.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.data.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}

                <PaginationNav paginated={sessions} />
            </div>
        </>
    );
}
