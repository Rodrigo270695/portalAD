<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

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
        $userId = $this->route('user')?->id;

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable','string', 'email', 'max:255'],
            'dni' => ['required', 'string', 'size:8', Rule::unique('users')->ignore($userId)],
            'cel' => ['required', 'string', 'size:9', Rule::unique('users')->ignore($userId)],
            'circuit_id' => ['required', 'exists:circuits,id'],
            'zonificado_id' => ['nullable', 'exists:users,id'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'active' => ['boolean'],
            'action' => ['nullable', 'in:PDV REGULAR,PDV PREMIUM'],
        ];

        // Si es una creación de usuario, la contraseña es requerida
        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
            $rules['email'] = ['nullable', 'string', 'email', 'max:255', 'unique:users'];
            $rules['dni'] = ['required', 'string', 'size:8', 'unique:users'];
            $rules['cel'] = ['required', 'string', 'size:9', 'unique:users'];
        }
        // Si es una actualización, la contraseña es opcional
        else if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['password'] = ['nullable', 'confirmed', Password::defaults()];
            $rules['email'] = ['nullable', 'string', 'email', 'max:255', "unique:users,email,{$userId}"];
            $rules['dni'] = ['required', 'string', 'size:8', "unique:users,dni,{$userId}"];
            $rules['cel'] = ['required', 'string', 'size:9', "unique:users,cel,{$userId}"];
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
            'name.required' => 'El nombre es requerido',
            'name.string' => 'El nombre debe ser texto',
            'name.max' => 'El nombre no debe exceder los 255 caracteres',
            'email.email' => 'El correo electrónico debe ser válido',
            'email.max' => 'El correo electrónico no debe exceder los 255 caracteres',
            'email.unique' => 'Este correo electrónico ya está registrado',
            'password.required' => 'La contraseña es requerida',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'dni.required' => 'El DNI es requerido',
            'dni.size' => 'El DNI debe tener 8 dígitos',
            'dni.unique' => 'Este DNI ya está registrado',
            'cel.required' => 'El celular es requerido',
            'cel.size' => 'El celular debe tener 9 dígitos',
            'cel.unique' => 'Este celular ya está registrado',
            'circuit_id.required' => 'El circuito es requerido',
            'circuit_id.exists' => 'El circuito seleccionado no existe',
            'zonificado_id.exists' => 'El zonificador seleccionado no existe',
            'role.required' => 'El rol es requerido',
            'role.exists' => 'El rol seleccionado no existe',
            'active.boolean' => 'El estado debe ser un valor booleano',
            'action.in' => 'La acción debe ser PDV REGULAR o PDV PREMIUM',
        ];
    }
}
