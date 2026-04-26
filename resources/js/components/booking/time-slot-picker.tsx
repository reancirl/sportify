import { Button } from '@/components/ui/button';
import { cn, formatInManila } from '@/lib/utils';

type Props = {
    slots: string[];
    selected: string | null;
    onSelect: (slot: string) => void;
    className?: string;
};

export function TimeSlotPicker({ slots, selected, onSelect, className }: Props) {
    if (slots.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No available time slots for this day.
            </p>
        );
    }

    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4',
                className,
            )}
            role="radiogroup"
            aria-label="Available time slots"
        >
            {slots.map((slot) => {
                const isSelected = selected === slot;

                return (
                    <Button
                        key={slot}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onSelect(slot)}
                        className="justify-center"
                    >
                        {formatInManila(slot, 'p')}
                    </Button>
                );
            })}
        </div>
    );
}
