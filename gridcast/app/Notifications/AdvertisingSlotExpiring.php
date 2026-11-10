<?php

namespace App\Notifications;

use App\Models\AdvertisingSlot;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdvertisingSlotExpiring extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public AdvertisingSlot $slot
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $advertiserName = $this->slot->advertiser?->company_name ?? 'Annonceur';
        $airDate = $this->slot->broadcast_date ? $this->slot->broadcast_date->format('d/m/Y H:i') : 'Date à définir';

        return [
            'advertising_slot_id' => $this->slot->id,
            'advertiser_name' => $advertiserName,
            'campaign_name' => $this->slot->campaign_name,
            'air_date' => $airDate,
            'message' => "Le créneau publicitaire pour « {$advertiserName} » ({$this->slot->campaign_name}) arrive à diffusion le {$airDate}.",
            'url' => route('advertising.index'),
        ];
    }
}
