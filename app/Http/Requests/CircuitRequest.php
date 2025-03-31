<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CircuitRequest extends FormRequest
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
        $uniqueRule = 'unique:circuits,name';
        if ($this->route('circuit')) {
            $uniqueRule .= ',' . $this->route('circuit')->id;
        }

        return [
            'name' => ['required', 'string', 'min:3', 'max:50', $uniqueRule],
            'description' => ['nullable', 'string', 'max:255'],
            'active' => ['required', 'boolean'],
            'zonal_id' => ['required', 'exists:zonals,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.min' => 'El nombre debe tener al menos :min caracteres',
            'name.max' => 'El nombre no puede tener más de :max caracteres',
            'name.unique' => 'Ya existe un circuito con este nombre',
            'description.max' => 'La descripción no puede tener más de :max caracteres',
            'active.required' => 'El estado es requerido',
            'active.boolean' => 'El estado debe ser verdadero o falso',
            'zonal_id.required' => 'La zonal es requerida',
            'zonal_id.exists' => 'La zonal seleccionada no existe',
        ];
    }
}
