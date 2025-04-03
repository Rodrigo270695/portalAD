<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class WebproductRequest extends FormRequest
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
                'max:255',
                Rule::unique('webproducts', 'name')->ignore($this->webproduct),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'product_id' => [
                'required',
                'exists:products,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.max' => 'El nombre no puede tener más de :max caracteres',
            'name.unique' => 'Ya existe un producto web con este nombre',
            'description.string' => 'La descripción debe ser texto',
            'product_id.required' => 'El producto es requerido',
            'product_id.exists' => 'El producto seleccionado no existe',
        ];
    }
}
