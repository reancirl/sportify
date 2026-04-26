<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentVerified extends Notification
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
            ->subject('Payment verified')
            ->greeting("Hi {$notifiable->name},")
            ->line('Your payment of ₱'.number_format((float) $this->payment->amount, 2).' has been verified.')
            ->line('Reference: '.($this->payment->reference_number ?? 'n/a'));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment.verified',
            'payment_id' => $this->payment->id,
            'amount' => (string) $this->payment->amount,
            'payable_type' => $this->payment->payable_type,
            'payable_id' => $this->payment->payable_id,
        ];
    }
}
