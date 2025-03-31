<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ZonalRequest extends FormRequest
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
            'name' => [
                'required',
                'min:3',
                'max:20',
                Rule::unique('zonals', 'name')->ignore($this->zonal),
            ],
            'short_name' => [
                'required',
                'min:2',
                'max:10',
                Rule::unique('zonals', 'short_name')->ignore($this->zonal),
            ],
            'active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio',
            'name.min' => 'El nombre debe tener al menos :min caracteres',
            'name.max' => 'El nombre no puede tener más de :max caracteres',
            'name.unique' => 'Ya existe un zonal con este nombre',
            'short_name.required' => 'El nombre corto es obligatorio',
            'short_name.min' => 'El nombre corto debe tener al menos :min caracteres',
            'short_name.max' => 'El nombre corto no puede tener más de :max caracteres',
            'short_name.unique' => 'Ya existe un zonal con este nombre corto',
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
