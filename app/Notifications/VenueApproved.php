<?php

namespace App\Notifications;

use App\Models\Venue;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VenueApproved extends Notification
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
            ->subject("Your venue has been approved — {$this->venue->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("{$this->venue->name} is now live on the platform.")
            ->action('Manage venue', url("/venue-admin/venues/{$this->venue->id}/edit"));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'venue.approved',
            'venue_id' => $this->venue->id,
            'venue_name' => $this->venue->name,
        ];
    }
}
