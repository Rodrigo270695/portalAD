<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class NotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'min:3',
                'max:255',
            ],
            'description' => [
                'required',
                'min:10',
            ],
            'type' => [
                'required',
                Rule::in(['URGENT', 'ALERT']),
            ],
            'status' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio',
            'title.min' => 'El título debe tener al menos :min caracteres',
            'title.max' => 'El título no puede tener más de :max caracteres',
            'description.required' => 'La descripción es obligatoria',
            'description.min' => 'La descripción debe tener al menos :min caracteres',
            'type.required' => 'El tipo es obligatorio',
            'type.in' => 'El tipo debe ser URGENT o ALERT',
            'start_date.required' => 'La fecha de inicio es obligatoria',
            'start_date.date' => 'La fecha de inicio debe ser una fecha válida',
            'end_date.date' => 'La fecha de fin debe ser una fecha válida',
            'end_date.after' => 'La fecha de fin debe ser posterior a la fecha de inicio',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Validation\ValidationException($validator);
    }
}
