<?php

namespace App\Notifications;

use App\Lib\Time;
use App\Models\OpenPlaySession;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SessionJoined extends Notification
{
    use Queueable;

    public function __construct(public readonly OpenPlaySession $session) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        // TODO: SMS
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $session = $this->session->loadMissing('venue');

        return (new MailMessage)
            ->subject("You're in — {$session->title}")
            ->greeting("Hi {$notifiable->name},")
            ->line("You've joined the open play session: {$session->title}.")
            ->line('Venue: '.$session->venue->name)
            ->line('Time: '.Time::displayManila($session->starts_at).' — '.Time::displayManila($session->ends_at))
            ->line('Fee: ₱'.number_format((float) $session->fee_per_player, 2));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'session.joined',
            'session_id' => $this->session->id,
            'title' => $this->session->title,
            'starts_at' => $this->session->starts_at?->toIso8601String(),
        ];
    }
}
