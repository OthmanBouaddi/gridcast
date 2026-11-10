<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProgramSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Program $program
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
        $producerName = $this->program->producer?->name ?? 'Un producteur';

        return [
            'program_id' => $this->program->id,
            'title' => $this->program->title,
            'producer_name' => $producerName,
            'message' => "{$producerName} a soumis un nouveau programme « {$this->program->title} » pour validation.",
            'url' => route('validation.index'),
        ];
    }
}
