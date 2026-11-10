<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAudienceReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        if ($this->hasFile('csv_file')) {
            return [
                'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
            ];
        }

        return [
            'broadcast_slot_id' => ['required', 'exists:broadcast_slots,id'],
            'audience_estimate' => ['required', 'integer', 'min:0'],
            'report_date' => ['required', 'date'],
            'rating_points' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'share_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
