import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { VenueSubNav } from '@/components/venue/venue-sub-nav';
import { cn } from '@/lib/utils';
import type { Models } from '@/types';

type Props = {
    venue: Models.Venue;
};

type SessionForm = {
    title: string;
    description: string;
    starts_at: string;
    ends_at: string;
    max_players: number;
    fee_per_player: string;
    min_skill_level: Models.SkillLevel | '';
    max_skill_level: Models.SkillLevel | '';
    court_ids: string[];
};

const SKILL_LEVELS: Models.SkillLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'pro',
];

const INPUT_CLASS =
    'h-10 rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0';

export default function VenueAdminSessionsCreate({ venue }: Props) {
    const courts = venue.courts ?? [];

    const form = useForm<SessionForm>({
        title: '',
        description: '',
        starts_at: '',
        ends_at: '',
        max_players: 8,
        fee_per_player: '0.00',
        min_skill_level: '',
        max_skill_level: '',
        court_ids: courts.length === 1 ? [courts[0].id] : [],
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/venue-admin/venues/${venue.id}/sessions`);
    };

    const toggleCourt = (id: string) => {
        const next = form.data.court_ids.includes(id)
            ? form.data.court_ids.filter((c) => c !== id)
            : [...form.data.court_ids, id];
        form.setData('court_ids', next);
    };

    return (
        <>
            <Head title={`${venue.name} — new session`} />

            <div className="flex flex-1 flex-col gap-8 p-6">
                <VenueSubNav venue={venue} />

                <div className="flex flex-col gap-3 border-b border-[#3e2817]/12 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5c3a21]">
                            <Sparkles className="size-3.5 text-[#f37021]" />
                            New session
                        </p>
                        <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-[#3e2817]">
                            Schedule open play
                        </h2>
                        <p className="font-serif text-sm text-[#5c3a21]">
                            Members across Iligan will see this session and
                            can register up to your player cap.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        asChild
                        className="h-9 gap-1.5 self-start text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21] hover:text-[#3e2817]"
                    >
                        <a href={`/venue-admin/venues/${venue.id}/sessions`}>
                            <ArrowLeft className="size-3.5" aria-hidden />
                            Back to sessions
                        </a>
                    </Button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 rounded-lg border border-[#3e2817]/15 bg-white p-8"
                >
                    <Field
                        label="Title"
                        htmlFor="session-title"
                        error={form.errors.title}
                        required
                    >
                        <Input
                            id="session-title"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="Friday Night Open Play"
                            className={INPUT_CLASS}
                        />
                    </Field>

                    <Field
                        label="Description (optional)"
                        htmlFor="session-description"
                        error={form.errors.description}
                    >
                        <Textarea
                            id="session-description"
                            rows={3}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Round-robin format. All levels welcome."
                            className="rounded-md border-[#3e2817]/20 bg-white text-sm shadow-none focus-visible:border-[#f37021] focus-visible:ring-0"
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Starts at"
                            htmlFor="session-starts"
                            error={form.errors.starts_at}
                            required
                        >
                            <Input
                                id="session-starts"
                                type="datetime-local"
                                value={form.data.starts_at}
                                onChange={(e) =>
                                    form.setData('starts_at', e.target.value)
                                }
                                className={INPUT_CLASS}
                            />
                        </Field>
                        <Field
                            label="Ends at"
                            htmlFor="session-ends"
                            error={form.errors.ends_at}
                            required
                        >
                            <Input
                                id="session-ends"
                                type="datetime-local"
                                value={form.data.ends_at}
                                onChange={(e) =>
                                    form.setData('ends_at', e.target.value)
                                }
                                className={INPUT_CLASS}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Max players"
                            htmlFor="session-max"
                            error={form.errors.max_players}
                            required
                        >
                            <Input
                                id="session-max"
                                type="number"
                                min={2}
                                max={64}
                                value={form.data.max_players}
                                onChange={(e) =>
                                    form.setData(
                                        'max_players',
                                        Number(e.target.value),
                                    )
                                }
                                className={INPUT_CLASS}
                            />
                        </Field>
                        <Field
                            label="Fee per player (₱)"
                            htmlFor="session-fee"
                            error={form.errors.fee_per_player}
                            required
                        >
                            <Input
                                id="session-fee"
                                type="number"
                                min="0"
                                step="50"
                                value={form.data.fee_per_player}
                                onChange={(e) =>
                                    form.setData(
                                        'fee_per_player',
                                        e.target.value,
                                    )
                                }
                                className={INPUT_CLASS}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Min skill level (optional)"
                            htmlFor="session-min-skill"
                            error={form.errors.min_skill_level}
                        >
                            <Select
                                value={form.data.min_skill_level}
                                onValueChange={(v) =>
                                    form.setData(
                                        'min_skill_level',
                                        v as Models.SkillLevel | '',
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="session-min-skill"
                                    className={INPUT_CLASS}
                                >
                                    <SelectValue placeholder="No minimum" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SKILL_LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field
                            label="Max skill level (optional)"
                            htmlFor="session-max-skill"
                            error={form.errors.max_skill_level}
                        >
                            <Select
                                value={form.data.max_skill_level}
                                onValueChange={(v) =>
                                    form.setData(
                                        'max_skill_level',
                                        v as Models.SkillLevel | '',
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="session-max-skill"
                                    className={INPUT_CLASS}
                                >
                                    <SelectValue placeholder="No maximum" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SKILL_LEVELS.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    {/* Courts — multi-select */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]">
                            Courts <span className="text-[#f37021]">*</span>
                        </p>
                        {courts.length === 0 ? (
                            <p className="rounded-md border border-dashed border-[#3e2817]/25 bg-[#faf5ec] px-4 py-3 font-serif text-sm text-[#5c3a21]">
                                You need at least one active court before
                                scheduling a session.{' '}
                                <a
                                    href={`/venue-admin/venues/${venue.id}/courts`}
                                    className="font-medium text-[#3e2817] underline-offset-4 hover:text-[#f37021] hover:underline"
                                >
                                    Add a court →
                                </a>
                            </p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {courts.map((court) => {
                                    const checked =
                                        form.data.court_ids.includes(court.id);

                                    return (
                                        <label
                                            key={court.id}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition',
                                                checked
                                                    ? 'border-[#f37021] bg-[#f37021]/5'
                                                    : 'border-[#3e2817]/15 bg-white hover:border-[#3e2817]/30',
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleCourt(court.id)
                                                }
                                                className="size-4 rounded border-[#3e2817]/25 accent-[#f37021]"
                                            />
                                            <div>
                                                <p className="font-display text-sm font-semibold text-[#3e2817]">
                                                    {court.name}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5c3a21]">
                                                    {court.slot_minutes}-min
                                                    slots
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        <InputError
                            message={form.errors.court_ids as string | undefined}
                            className="text-xs text-red-700"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-[#3e2817]/12 pt-6">
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                form.data.court_ids.length === 0
                            }
                            className="h-10 gap-2 rounded-md bg-[#3e2817] px-6 text-[10px] font-medium uppercase tracking-[0.22em] text-[#faf5ec] shadow-none hover:bg-[#2a1a0e] disabled:opacity-60"
                        >
                            {form.processing && <Spinner />}
                            Schedule session
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function Field({
    label,
    htmlFor,
    error,
    children,
    required,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#5c3a21]"
            >
                {label}
                {required && <span className="text-[#f37021]">*</span>}
            </label>
            {children}
            <InputError message={error} className="text-xs text-red-700" />
        </div>
    );
}
