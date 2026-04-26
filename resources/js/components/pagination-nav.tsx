import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Models } from '@/types';

type Props<T> = {
    paginated: Models.PaginatedResponse<T>;
    className?: string;
};

export function PaginationNav<T>({ paginated, className }: Props<T>) {
    if (!paginated || paginated.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className={`flex items-center justify-between gap-4 ${className ?? ''}`}
            aria-label="Pagination"
        >
            <p className="text-sm text-muted-foreground">
                Page {paginated.current_page} of {paginated.last_page}{' '}
                ({paginated.total} results)
            </p>
            <div className="flex gap-2">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!paginated.prev_page_url}
                >
                    <Link
                        href={paginated.prev_page_url ?? '#'}
                        preserveScroll
                        preserveState
                        aria-disabled={!paginated.prev_page_url}
                    >
                        Previous
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!paginated.next_page_url}
                >
                    <Link
                        href={paginated.next_page_url ?? '#'}
                        preserveScroll
                        preserveState
                        aria-disabled={!paginated.next_page_url}
                    >
                        Next
                    </Link>
                </Button>
            </div>
        </nav>
    );
}
