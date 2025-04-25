<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Circuit;
use App\Traits\LogsActivity;

class Tack extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'active',
        'circuit_id',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function circuit(): BelongsTo
    {
        return $this->belongsTo(Circuit::class);
    }
}
