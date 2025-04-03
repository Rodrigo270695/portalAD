<?php

namespace App\Models;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebProduct extends Model
{
    protected $table = 'webproducts';

    protected $fillable = [
        'name',
        'description',
        'product_id',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'webproduct_id', 'id');
    }
}
