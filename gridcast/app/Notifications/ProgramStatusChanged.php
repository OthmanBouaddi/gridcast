<?php

namespace App\Notifications;

use App\Models\Program;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProgramStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Program $program,
        public string $status,
        public ?string $reason = null
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
        $message = match ($this->status) {
            Program::STATUS_VALIDE => "Votre programme « {$this->program->title} » a été validé par la programmation.",
            Program::STATUS_REJETE => "Votre programme « {$this->program->title} » a été rejeté. Motif : " . ($this->reason ?? 'Non conforme.'),
            default => "Le statut de votre programme « {$this->program->title} » est passé à {$this->status}.",
        };

        return [
            'program_id' => $this->program->id,
            'title' => $this->program->title,
            'status' => $this->status,
            'reason' => $this->reason,
            'message' => $message,
            'url' => route('programs.show', $this->program->id),
        ];
    }
}
