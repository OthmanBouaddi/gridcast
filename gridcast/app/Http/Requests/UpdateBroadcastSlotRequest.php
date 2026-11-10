<?php

namespace App\Http\Requests;

use App\Rules\NoBroadcastOverlap;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBroadcastSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        $slot = $this->route('broadcast_slot');

        return $this->user()?->can('update', $slot) ?? false;
    }

    public function rules(): array
    {
        $slot = $this->route('broadcast_slot');
        $slotId = is_object($slot) ? $slot->id : (int) $slot;

        return [
            'program_id' => ['nullable', 'exists:programs,id'],
            'episode_id' => ['nullable', 'exists:episodes,id'],
            'slot_type' => ['required', 'in:program,pub'],
            'title' => ['nullable', 'string', 'max:255'],
            'channel_zone' => ['required', 'string', 'max:100'],
            'start_datetime' => ['required', 'date', new NoBroadcastOverlap($slotId)],
            'end_datetime' => ['required', 'date', 'after:start_datetime'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
