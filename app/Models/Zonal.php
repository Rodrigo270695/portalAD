<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Zonal extends Model
{
    protected $fillable = [
        'name',
        'short_name',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Scope a query to filter zonals by search term.
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('short_name', 'like', "%{$search}%");
        }
    }
}
