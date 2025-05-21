<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'type',
        'status',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    protected $searchableFields = [
        'title',
        'description',
        'type',
    ];

    /**
     * Get active notifications for the current date.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getActiveNotifications()
    {
        $now = Carbon::now();
        $today = $now->format('Y-m-d');

        return static::where('status', true)
            ->where(function ($query) use ($today) {
                $query->where(function ($q) use ($today) {
                    // Notificaciones que empiezan hoy
                    $q->whereDate('start_date', '=', $today)
                        ->where(function ($sq) {
                            $sq->whereNull('end_date')
                                ->orWhereDate('end_date', '>=', Carbon::now());
                        });
                })->orWhere(function ($q) use ($today) {
                    // Notificaciones urgentes que están en su período de validez
                    $q->where('type', 'URGENT')
                        ->whereDate('start_date', '<=', $today)
                        ->where(function ($sq) use ($today) {
                            $sq->whereNull('end_date')
                                ->orWhereDate('end_date', '>=', $today);
                        });
                });
            })
            ->orderBy('type', 'desc') // URGENT primero
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
