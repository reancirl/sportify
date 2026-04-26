<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRejected extends Notification
{
    use Queueable;

    public function __construct(public readonly Payment $payment) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        // TODO: SMS
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment rejected')
            ->greeting("Hi {$notifiable->name},")
            ->line('Your payment of ₱'.number_format((float) $this->payment->amount, 2).' was rejected.')
            ->when($this->payment->rejection_reason, fn ($m) => $m->line("Reason: {$this->payment->rejection_reason}"))
            ->line('Please re-upload a valid proof of payment.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment.rejected',
            'payment_id' => $this->payment->id,
            'amount' => (string) $this->payment->amount,
            'rejection_reason' => $this->payment->rejection_reason,
        ];
    }
}
