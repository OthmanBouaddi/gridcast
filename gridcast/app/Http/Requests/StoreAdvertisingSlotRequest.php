<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdvertisingSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isRegie() ?? false;
    }

    public function rules(): array
    {
        return [
            'advertiser_id' => ['required', 'exists:advertisers,id'],
            'broadcast_slot_id' => ['nullable', 'exists:broadcast_slots,id'],
            'campaign_name' => ['required', 'string', 'max:255'],
            'broadcast_date' => ['nullable', 'date'],
            'duration_seconds' => ['required', 'integer', 'min:5', 'max:300'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:reserve,diffuse,annule'],
        ];
    }
}
