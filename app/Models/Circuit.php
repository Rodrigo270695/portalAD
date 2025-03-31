<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Zonal;
use App\Models\Tack;

class Circuit extends Model
{
    protected $fillable = [
        'name',
        'address',
        'active',
        'zonal_id',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the zonal that owns the circuit.
     */
    public function zonal(): BelongsTo
    {
        return $this->belongsTo(Zonal::class);
    }

    /**
     * Get the tacks for the circuit.
     */
    public function tacks(): HasMany
    {
        return $this->hasMany(Tack::class);
    }

    /**
     * Scope a query to filter circuits by search term.
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhereHas('zonal', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('short_name', 'like', "%{$search}%");
                });
        }
    }
}
