import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { Models } from '@/types';

type CourtFormData = {
    name: string;
    description: string;
    hourly_rate: string;
    slot_minutes: number;
    is_active: boolean;
};

type Props = {
    court?: Models.Court;
    submitUrl: string;
    method?: 'post' | 'put' | 'patch';
    submitLabel?: string;
};

export function CourtForm({
    court,
    submitUrl,
    method = 'post',
    submitLabel = 'Save court',
}: Props) {
    const form = useForm<CourtFormData>({
        name: court?.name ?? '',
        description: court?.description ?? '',
        hourly_rate: court?.hourly_rate ?? '0.00',
        slot_minutes: court?.slot_minutes ?? 60,
        is_active: court?.is_active ?? true,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.submit(method, submitUrl, { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="court-name">Court name</Label>
                <Input
                    id="court-name"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    required
                />
                <InputError message={form.errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="court-description">Description</Label>
                <Textarea
                    id="court-description"
                    rows={3}
                    value={form.data.description}
                    onChange={(event) => form.setData('description', event.target.value)}
                />
                <InputError message={form.errors.description} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="court-rate">Hourly rate (PHP)</Label>
                    <Input
                        id="court-rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.data.hourly_rate}
                        onChange={(event) => form.setData('hourly_rate', event.target.value)}
                        required
                    />
                    <InputError message={form.errors.hourly_rate} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="court-slot">Slot length (minutes)</Label>
                    <Input
                        id="court-slot"
                        type="number"
                        min="15"
                        step="15"
                        value={form.data.slot_minutes}
                        onChange={(event) =>
                            form.setData('slot_minutes', Number(event.target.value))
                        }
                        required
                    />
                    <InputError message={form.errors.slot_minutes} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="court-active"
                    checked={form.data.is_active}
                    onCheckedChange={(checked) =>
                        form.setData('is_active', checked === true)
                    }
                />
                <Label htmlFor="court-active">Active and bookable</Label>
            </div>
            <InputError message={form.errors.is_active} />

            <Button type="submit" disabled={form.processing}>
                {form.processing && <Spinner />}
                {submitLabel}
            </Button>
        </form>
    );
}
