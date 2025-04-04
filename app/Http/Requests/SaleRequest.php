<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
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
            'date' => [
                'required',
                'date',
            ],
            'cluster_quality' => [
                'nullable',
                'string',
            ],
            'recharge_date' => [
                'nullable',
                'date',
            ],
            'recharge_amount' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'accumulated_amount' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'commissionable_charge' => [
                'required',
                'boolean',
            ],
            'action' => [
                'nullable',
                'string',
            ],
            'user_id' => [
                'required',
                'exists:users,id',
            ],
            'webproduct_id' => [
                'required',
                'exists:webproducts,id',
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
            'date.required' => 'La fecha es obligatoria.',
            'date.date' => 'La fecha no tiene un formato válido.',
            'cluster_quality.in' => 'La calidad del cluster debe ser A+, A, B o C.',
            'recharge_date.date' => 'La fecha de recarga no tiene un formato válido.',
            'recharge_amount.integer' => 'El monto de recarga debe ser un número entero.',
            'recharge_amount.min' => 'El monto de recarga no puede ser negativo.',
            'accumulated_amount.integer' => 'El monto acumulado debe ser un número entero.',
            'accumulated_amount.min' => 'El monto acumulado no puede ser negativo.',
            'commissionable_charge.required' => 'El cargo comisionable es obligatorio.',
            'commissionable_charge.boolean' => 'El cargo comisionable debe ser verdadero o falso.',
            'action.in' => 'La acción debe ser REGULAR o PREMIUM.',
            'user_id.required' => 'El usuario es obligatorio.',
            'user_id.exists' => 'El usuario seleccionado no es válido.',
            'webproduct_id.required' => 'El producto web es obligatorio.',
            'webproduct_id.exists' => 'El producto web seleccionado no es válido.',
        ];
    }
}
