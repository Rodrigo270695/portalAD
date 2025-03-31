<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:20',
                Rule::unique('tacks', 'name')->ignore($this->tack),
            ],
            'active' => [
                'required',
                'boolean',
            ],
            'circuit_id' => [
                'required',
                'exists:circuits,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.max' => 'El nombre no puede tener más de :max caracteres',
            'name.unique' => 'Ya existe una ruta con este nombre',
            'active.required' => 'El estado es requerido',
            'active.boolean' => 'El estado debe ser verdadero o falso',
            'circuit_id.required' => 'El circuito es requerido',
            'circuit_id.exists' => 'El circuito seleccionado no existe',
        ];
    }
}
