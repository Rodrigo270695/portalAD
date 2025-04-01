<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SellerRequest extends FormRequest
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
        $rules = [
            'name' => ['nullable', 'string', 'max:60'],
            'dni' => ['required', 'digits:8'],
            'cel' => ['nullable', 'digits:9'],
            'pdv_id' => ['required', 'exists:users,id'],
        ];

        if ($this->isMethod('post')) {
            $rules['dni'] = ['required', 'digits:8', 'unique:sellers'];
            $rules['cel'] = ['nullable', 'digits:9', 'unique:sellers'];
        } else if ($this->isMethod('put') || $this->isMethod('patch')) {
            $sellerId = $this->route('seller')->id;
            $rules['dni'] = ['required', 'digits:8', "unique:sellers,dni,{$sellerId}"];
            $rules['cel'] = ['nullable', 'digits:9', "unique:sellers,cel,{$sellerId}"];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.max' => 'El nombre no puede tener más de 60 caracteres.',
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos numéricos.',
            'dni.unique' => 'Este DNI ya está registrado.',
            'cel.digits' => 'El celular debe tener exactamente 9 dígitos numéricos.',
            'cel.unique' => 'Este número de celular ya está registrado.',
            'pdv_id.required' => 'El PDV es obligatorio.',
            'pdv_id.exists' => 'El PDV seleccionado no existe.',
        ];
    }
}
