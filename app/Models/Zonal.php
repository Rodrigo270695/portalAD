<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zonal extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'short_name',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the circuits for the zonal.
     */
    public function circuits(): HasMany
    {
        return $this->hasMany(Circuit::class);
    }

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
