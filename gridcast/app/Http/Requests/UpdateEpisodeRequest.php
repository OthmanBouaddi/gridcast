<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $episode = $this->route('episode');

        return $this->user()?->can('update', $episode) ?? false;
    }

    public function rules(): array
    {
        return [
            'season' => ['required', 'integer', 'min:1'],
            'episode_number' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'air_status' => ['required', 'in:a_venir,diffuse,archive'],
        ];
    }
}
