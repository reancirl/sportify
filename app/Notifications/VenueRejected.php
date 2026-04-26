<?php

namespace App\Notifications;

use App\Models\Venue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VenueRejected extends Notification
{
    use Queueable;

    public function __construct(public readonly Venue $venue) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        // TODO: SMS
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Venue application not approved — {$this->venue->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Unfortunately, {$this->venue->name} was not approved.")
            ->when($this->venue->rejection_reason, fn ($m) => $m->line("Reason: {$this->venue->rejection_reason}"))
            ->line('You may revise the venue and resubmit for review.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'venue.rejected',
            'venue_id' => $this->venue->id,
            'venue_name' => $this->venue->name,
            'rejection_reason' => $this->venue->rejection_reason,
        ];
    }
}
