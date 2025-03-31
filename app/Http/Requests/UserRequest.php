<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'dni' => ['required', 'string', 'size:8'],
            'cel' => ['required', 'string', 'size:9'],
            'circuit_id' => ['required', 'exists:circuits,id'],
            'zonificado_id' => ['nullable', 'exists:users,id'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ];

        // Si es una creación de usuario, la contraseña es requerida
        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
            $rules['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
            $rules['dni'] = ['required', 'string', 'size:8', 'unique:users'];
            $rules['cel'] = ['required', 'string', 'size:9', 'unique:users'];
        }
        // Si es una actualización, la contraseña es opcional
        else if ($this->isMethod('put') || $this->isMethod('patch')) {
            $userId = $this->route('user')->id;
            $rules['password'] = ['nullable', 'confirmed', Password::defaults()];
            $rules['email'] = ['required', 'string', 'email', 'max:255', "unique:users,email,{$userId}"];
            $rules['dni'] = ['required', 'string', 'size:8', "unique:users,dni,{$userId}"];
            $rules['cel'] = ['required', 'string', 'size:9', "unique:users,cel,{$userId}"];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.max' => 'El nombre no puede tener más de :max caracteres',
            'email.required' => 'El correo electrónico es requerido',
            'email.email' => 'El correo electrónico debe ser válido',
            'email.unique' => 'Este correo electrónico ya está en uso',
            'dni.required' => 'El DNI es requerido',
            'dni.size' => 'El DNI debe tener exactamente :size dígitos',
            'dni.unique' => 'Este DNI ya está en uso',
            'cel.required' => 'El número de celular es requerido',
            'cel.size' => 'El número de celular debe tener exactamente :size dígitos',
            'cel.unique' => 'Este número de celular ya está en uso',
            'password.required' => 'La contraseña es requerida',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'circuit_id.required' => 'El circuito es requerido',
            'circuit_id.exists' => 'El circuito seleccionado no existe',
            'zonificado_id.exists' => 'El zonificador seleccionado no existe',
            'role.required' => 'El rol es requerido',
            'role.exists' => 'El rol seleccionado no existe',
        ];
    }
}
