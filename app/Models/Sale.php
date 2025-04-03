<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\WebProduct;

class Sale extends Model
{
    protected $fillable = [
        'date',
        'cluster_quality',
        'recharge_date',
        'recharge_amount',
        'accumulated_amount',
        'commissionable_charge',
        'action',
        'user_id',
        'webproduct_id',
    ];

    protected $casts = [
        'date' => 'date',
        'recharge_date' => 'date',
        'recharge_amount' => 'integer',
        'accumulated_amount' => 'integer',
        'commissionable_charge' => 'boolean',
    ];

    /**
     * Get the user that owns the sale.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the web product associated with the sale.
     */
    public function webProduct(): BelongsTo
    {
        return $this->belongsTo(WebProduct::class);
    }

    /**
     * Scope a query to filter sales by search term.
     */
    public function scopeSearch(Builder $query, ?string $search): void
    {
        if ($search) {
            $query->where('date', 'like', "%{$search}%")
                ->orWhere('cluster_quality', 'like', "%{$search}%")
                ->orWhere('recharge_amount', 'like', "%{$search}%")
                ->orWhere('accumulated_amount', 'like', "%{$search}%")
                ->orWhere('action', 'like', "%{$search}%")
                ->orWhereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('webProduct', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                });
        }
    }
}
