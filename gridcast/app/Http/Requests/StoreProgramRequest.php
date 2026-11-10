<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProducteur() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'language' => ['required', 'in:ar,fr,darija'],
            'synopsis' => ['nullable', 'string', 'max:2000'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:360'],
            'submit_now' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du programme est obligatoire.',
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists' => 'La catégorie sélectionnée est invalide.',
            'language.required' => 'La langue de diffusion est requise.',
            'language.in' => 'La langue doit être arabe (ar), français (fr) ou darija (darija).',
            'duration_minutes.required' => 'La durée en minutes est requise.',
            'duration_minutes.min' => 'La durée minimale est de 1 minute.',
        ];
    }
}
