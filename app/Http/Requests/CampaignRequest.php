<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:100|unique:campaigns,name,' . ($this->campaign ? $this->campaign->id : ''),
            'description' => 'nullable|string|max:255',
            'type' => 'required|string|in:Esquema,Acelerador,Información',
            'date_start' => 'required|date',
            'date_end' => 'required|date|after_or_equal:date_start',
            'status' => 'boolean',
        ];

        // Solo requerimos la imagen en la creación
        if ($this->isMethod('POST')) {
            $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
        } else {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es requerido',
            'name.unique' => 'Este nombre de campaña ya existe',
            'name.max' => 'El nombre no puede tener más de 100 caracteres',
            'description.max' => 'La descripción no puede tener más de 255 caracteres',
            'type.required' => 'El tipo es requerido',
            'type.in' => 'El tipo debe ser Esquema, Acelerador o Información',
            'image.required' => 'La imagen es requerida',
            'image.image' => 'El archivo debe ser una imagen',
            'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif',
            'image.max' => 'La imagen no debe pesar más de 2MB',
            'date_start.required' => 'La fecha de inicio es requerida',
            'date_start.date' => 'La fecha de inicio debe ser una fecha válida',
            'date_end.required' => 'La fecha de fin es requerida',
            'date_end.date' => 'La fecha de fin debe ser una fecha válida',
            'date_end.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
        ];
    }
}
