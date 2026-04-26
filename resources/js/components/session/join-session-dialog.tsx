import { useForm } from '@inertiajs/react';
import { useState   } from 'react';
import type {FormEvent, ReactNode} from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { formatPHP } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    session: Models.OpenPlaySession;
    trigger: ReactNode;
};

type JoinForm = {
    notes: string;
};

export function JoinSessionDialog({ session, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm<JoinForm>({ notes: '' });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/sessions/${session.id}/join`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Join {session.title}</DialogTitle>
                        <DialogDescription>
                            Joining costs {formatPHP(session.fee_per_player)}. After
                            confirming you will be asked to upload a payment proof.
                        </DialogDescription>
                    </DialogHeader>

                    <InputError message={form.errors.notes} />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Confirm join
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
