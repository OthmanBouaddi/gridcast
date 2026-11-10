<?php

namespace App\Http\Requests;

use App\Rules\NoBroadcastOverlap;
use Illuminate\Foundation\Http\FormRequest;

class StoreBroadcastSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProgrammation() ?? false;
    }

    public function rules(): array
    {
        return [
            'program_id' => ['nullable', 'exists:programs,id'],
            'episode_id' => ['nullable', 'exists:episodes,id'],
            'slot_type' => ['required', 'in:program,pub'],
            'title' => ['nullable', 'string', 'max:255'],
            'channel_zone' => ['required', 'string', 'max:100'],
            'start_datetime' => ['required', 'date', new NoBroadcastOverlap()],
            'end_datetime' => ['required', 'date', 'after:start_datetime'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_datetime.required' => 'La date et l\'heure de début sont requises.',
            'end_datetime.required' => 'La date et l\'heure de fin sont requises.',
            'end_datetime.after' => 'La date de fin doit être postérieure à la date de début.',
            'slot_type.required' => 'Le type de créneau est requis (programme ou pub).',
        ];
    }
}
