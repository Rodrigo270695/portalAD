<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'image',
        'date_start',
        'date_end',
        'status',
    ];

    protected $enumTypes = [
        'type' => ['Esquema', 'Acelerador', 'Información'],
    ];

    protected $casts = [
        'date_start' => 'datetime',
        'date_end' => 'datetime',
        'status' => 'boolean',
    ];

    // Obtener la URL de la imagen
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }

    // Eliminar la imagen al eliminar el registro
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($campaign) {
            if ($campaign->image && Storage::exists($campaign->image)) {
                Storage::delete($campaign->image);
            }
        });
    }
}
