<?php

namespace App\Http\Requests;

use App\Models\Share;
use Illuminate\Foundation\Http\FormRequest;

class ShareRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'year' => [
                'required',
                'integer',
                'min:2000',
                'max:' . (date('Y') + 1),
            ],
            'month' => [
                'required',
                'integer',
                'min:1',
                'max:12',
            ],
            'amount' => [
                'required',
                'integer',
                'min:0',
            ],
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $year = $this->input('year');
                    $month = $this->input('month');
                    $shareId = $this->route('share'); // Para edición

                    $query = Share::where('user_id', $value)
                        ->where('year', $year)
                        ->where('month', $month);

                    if ($shareId) {
                        $query->where('id', '!=', $shareId);
                    }

                    if ($query->exists()) {
                        $fail('Ya existe una cuota para este PDV en el mes y año seleccionados.');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'year.required' => 'El año es obligatorio.',
            'year.integer' => 'El año debe ser un número entero.',
            'year.min' => 'El año debe ser mayor o igual a :min.',
            'year.max' => 'El año debe ser menor o igual a :max.',
            'month.required' => 'El mes es obligatorio.',
            'month.integer' => 'El mes debe ser un número entero.',
            'month.min' => 'El mes debe estar entre 1 y 12.',
            'month.max' => 'El mes debe estar entre 1 y 12.',
            'amount.required' => 'El monto es obligatorio.',
            'amount.integer' => 'El monto debe ser un número entero.',
            'amount.min' => 'El monto no puede ser negativo.',
            'user_id.required' => 'El usuario es obligatorio.',
            'user_id.exists' => 'El usuario seleccionado no es válido.',
        ];
    }
}
