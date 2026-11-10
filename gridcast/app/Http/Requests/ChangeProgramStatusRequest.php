<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Foundation\Http\FormRequest;

class ChangeProgramStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:brouillon,soumis,valide,rejete'],
            'rejection_reason' => ['nullable', 'required_if:status,rejete', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Program $program */
            $program = $this->route('program');
            $targetStatus = $this->input('status');
            $user = $this->user();

            if (!$program) {
                return;
            }

            if (!$program->canTransitionTo($targetStatus, $user)) {
                $validator->errors()->add(
                    'status',
                    "La transition de « {$program->status} » vers « {$targetStatus} » n'est pas autorisée pour votre rôle."
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required_if' => 'Le motif du rejet est obligatoire lors du refus d\'un programme.',
        ];
    }
}
