<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Zonal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class ActivityAnalyticsController extends Controller
{
    public function index()
    {
        // Tiempo promedio de sesión por usuario
        $averageSessionTime = ActivityLog::select('user_id', DB::raw('AVG(additional_data->>"$.response_time") as avg_time'))
            ->groupBy('user_id')
            ->get();

        // Patrones de uso por día de la semana
        $weekdayPatterns = ActivityLog::select(
            DB::raw('DAYOFWEEK(created_at) as day'),
            DB::raw('COUNT(*) as count'),
            DB::raw('AVG(additional_data->>"$.response_time") as avg_response_time')
        )
            ->groupBy('day')
            ->get();

        // Rutas más visitadas
        $topRoutes = ActivityLog::select('route', DB::raw('COUNT(*) as visits'))
            ->groupBy('route')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();

        // Acciones más frecuentes por zonal
        $actionsByZonal = Zonal::select(
            'zonals.name as zonal_name',
            'activity_logs.action',
            DB::raw('COUNT(*) as count')
        )
            ->join('circuits', 'zonals.id', '=', 'circuits.zonal_id')
            ->join('users', 'circuits.id', '=', 'users.circuit_id')
            ->join('activity_logs', 'users.id', '=', 'activity_logs.user_id')
            ->groupBy('zonals.name', 'activity_logs.action')
            ->orderBy('zonals.name')
            ->orderByDesc('count')
            ->get();

        // Comparativa días laborables vs fines de semana
        $weekendVsWeekday = [
            'weekend' => ActivityLog::whereRaw('DAYOFWEEK(created_at) IN (1, 7)')->count(),
            'weekday' => ActivityLog::whereRaw('DAYOFWEEK(created_at) NOT IN (1, 7)')->count(),
        ];

        // Mapa de calor de actividad
        $heatmap = ActivityLog::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('DAYOFWEEK(created_at) as day'),
            DB::raw('COUNT(*) as intensity')
        )
            ->groupBy('hour', 'day')
            ->get();

        // Timeline de Actividades (Paginado)
        $userTimeline = ActivityLog::with([
            'user.circuit.zonal:id,name',
            'user:id,name,email,circuit_id'
        ])
            ->select([
                'activity_logs.*',
                'users.circuit_id'
            ])
            ->join('users', 'activity_logs.user_id', '=', 'users.id')
            ->orderBy('activity_logs.created_at', 'desc')
            ->paginate(15)
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user' => [
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                        'circuit' => $activity->user->circuit ? [
                            'zonal' => [
                                'name' => $activity->user->circuit->zonal->name ?? null
                            ]
                        ] : null
                    ],
                    'action' => $activity->action,
                    'ip_address' => $activity->ip_address,
                    'created_at' => $activity->created_at,
                    'additional_data' => array_merge($activity->additional_data ?? [], [
                        'device_type' => $activity->device_type
                    ])
                ];
            });

        // Patrones inusuales
        $unusualPatterns = ActivityLog::where('additional_data->is_unusual', true)
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // IPs sospechosas (más de 100 actividades en 1 hora)
        $suspiciousIps = ActivityLog::select('ip_address', DB::raw('COUNT(*) as attempts'))
            ->where('created_at', '>=', now()->subHour())
            ->groupBy('ip_address')
            ->having('attempts', '>', 100)
            ->get();

        // Predicción de carga
        $hourlyAverages = ActivityLog::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('COUNT(*) / 7 as average_load')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy('hour')
            ->get();

        // Nuevas métricas administrativas
        $deviceStats = ActivityLog::select(
            'additional_data->device_type as device',
            DB::raw('COUNT(*) as count')
        )
            ->whereNotNull('additional_data->device_type')
            ->groupBy('additional_data->device_type')
            ->get();

        $responseTimesByZonal = Zonal::select(
            'zonals.name',
            DB::raw('AVG(activity_logs.additional_data->>"$.response_time") as avg_response_time'),
            DB::raw('COUNT(activity_logs.id) as total_activities')
        )
            ->join('circuits', 'zonals.id', '=', 'circuits.zonal_id')
            ->join('users', 'circuits.id', '=', 'users.circuit_id')
            ->join('activity_logs', 'users.id', '=', 'activity_logs.user_id')
            ->groupBy('zonals.name')
            ->get();

        $monthlyActivity = ActivityLog::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as total')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $userEngagement = User::select(
            'users.name',
            DB::raw('COUNT(activity_logs.id) as activity_count'),
            DB::raw('MAX(activity_logs.created_at) as last_activity'),
            DB::raw('AVG(activity_logs.additional_data->>"$.response_time") as avg_response_time')
        )
            ->leftJoin('activity_logs', 'users.id', '=', 'activity_logs.user_id')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('activity_count')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/ActivityAnalytics', [
            'averageSessionTime' => $averageSessionTime,
            'weekdayPatterns' => $weekdayPatterns,
            'topRoutes' => $topRoutes,
            'actionsByZonal' => $actionsByZonal,
            'weekendVsWeekday' => $weekendVsWeekday,
            'heatmap' => $heatmap,
            'userTimeline' => $userTimeline,
            'unusualPatterns' => $unusualPatterns,
            'suspiciousIps' => $suspiciousIps,
            'predictedLoad' => $hourlyAverages,
            // Nuevas métricas
            'deviceStats' => $deviceStats,
            'responseTimesByZonal' => $responseTimesByZonal,
            'monthlyActivity' => $monthlyActivity,
            'userEngagement' => $userEngagement,
        ]);
    }
}
