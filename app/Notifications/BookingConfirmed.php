<?php

namespace App\Notifications;

use App\Lib\Time;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmed extends Notification
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
        $booking = $this->booking->loadMissing('court.venue');

        return (new MailMessage)
            ->subject('Booking confirmed — '.$booking->court->venue->name)
            ->greeting("Hi {$notifiable->name},")
            ->line("Your booking at {$booking->court->venue->name} is confirmed.")
            ->line("Court: {$booking->court->name}")
            ->line('Time: '.Time::displayManila($booking->starts_at))
            ->line('Total: ₱'.number_format((float) $booking->total_amount, 2));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'booking.confirmed',
            'booking_id' => $this->booking->id,
            'court_name' => $this->booking->court?->name,
            'venue_name' => $this->booking->court?->venue?->name,
            'starts_at' => $this->booking->starts_at?->toIso8601String(),
        ];
    }
}
