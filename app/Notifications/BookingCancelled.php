<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelled extends Notification
{
    use Queueable;

    public function __construct(public readonly Booking $booking) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        // TODO: SMS
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Booking cancelled')
            ->greeting("Hi {$notifiable->name},")
            ->line('Your booking has been cancelled.')
            ->when($this->booking->cancellation_reason, fn ($m) => $m->line("Reason: {$this->booking->cancellation_reason}"));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking.cancelled',
            'booking_id' => $this->booking->id,
            'cancellation_reason' => $this->booking->cancellation_reason,
        ];
    }
}
