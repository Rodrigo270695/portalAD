<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Seller extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'dni',
        'cel',
        'pdv_id',
    ];

    /**
     * Get the PDV (punto de venta) that owns the seller.
     */
    public function pdv(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pdv_id');
    }
}
