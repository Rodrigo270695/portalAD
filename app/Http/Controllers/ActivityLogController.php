<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Circuit;
use App\Models\Zonal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ActivityLogsExport;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'circuit_id')
                        ->with(['circuit' => function ($query) {
                            $query->select('id', 'name', 'zonal_id')
                                ->with('zonal:id,name');
                        }]);
                }
            ]);

        // Aplicar filtros si existen
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Nuevo: Filtro por zonal
        if ($request->filled('zonal_id')) {
            $query->whereHas('user.circuit.zonal', function ($q) use ($request) {
                $q->where('zonals.id', $request->zonal_id);
            });
        }

        // Obtener actividades paginadas
        $activities = $query
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user' => [
                        'name' => $activity->user?->name ?? '-',
                        'email' => $activity->user?->email ?? '-',
                        'circuit' => $activity->user?->circuit ? [
                            'zonal' => [
                                'name' => $activity->user?->circuit?->zonal?->name ?? '-'
                            ]
                        ] : null
                    ],
                    'action' => $activity->action,
                    'ip_address' => $activity->ip_address,
                    'created_at' => $activity->created_at,
                    'additional_data' => array_merge($activity->additional_data ?? [], [
                        'device_type' => $activity->device_type ?? '-',
                        'response_time' => $activity->additional_data['response_time'] ?? null
                    ])
                ];
            });

        // Obtener lista de usuarios para el filtro
        $users = User::select('users.id', 'users.name', 'users.email')
            ->join('activity_logs', 'users.id', '=', 'activity_logs.user_id')
            ->distinct()
            ->orderBy('users.name')
            ->get();

        // Nuevo: Obtener lista de zonales para el filtro
        $zonales = Zonal::select('id', 'name')->orderBy('name')->get();

        // Obtener estadísticas filtradas
        $statsQuery = ActivityLog::query();

        // Aplicar los mismos filtros a las estadísticas
        if ($request->filled('user_id')) {
            $statsQuery->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $statsQuery->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $statsQuery->whereDate('created_at', '<=', $request->date_to);
        }

        // Estadísticas generales filtradas
        $stats = [
            'general' => [
                'total_users' => $users->count(),
                'active_today' => $statsQuery->clone()
                    ->whereDate('created_at', today())
                    ->distinct('user_id')
                    ->count(),
                'pwa_users' => $statsQuery->clone()
                    ->whereJsonContains('additional_data->launch_type', 'pwa')
                    ->distinct('user_id')
                    ->count(),
                'total_activities' => $statsQuery->clone()->count()
            ],
            'zonal' => Zonal::select('zonals.id as zonal_id', 'zonals.name as zonal_name')
                ->leftJoin('circuits', 'circuits.zonal_id', '=', 'zonals.id')
                ->leftJoin('users', 'users.circuit_id', '=', 'circuits.id')
                ->leftJoin('activity_logs', function ($join) use ($statsQuery) {
                    $join->on('activity_logs.user_id', '=', 'users.id');
                    // Aplicar los mismos filtros de fecha si existen
                    if (request()->filled('date_from')) {
                        $join->whereDate('activity_logs.created_at', '>=', request('date_from'));
                    }
                    if (request()->filled('date_to')) {
                        $join->whereDate('activity_logs.created_at', '<=', request('date_to'));
                    }
                })
                ->groupBy('zonals.id', 'zonals.name')
                ->selectRaw('
                    COUNT(DISTINCT users.id) as total_users,
                    COUNT(DISTINCT activity_logs.id) as total_activities,
                    COUNT(DISTINCT CASE WHEN activity_logs.action = "login" THEN users.id END) as users_with_login,
                    COUNT(CASE WHEN activity_logs.action = "login" THEN 1 END) as total_logins
                ')
                ->get(),
            'devices' => [
                'phone' => $statsQuery->clone()->where('device_type', 'phone')->count(),
                'tablet' => $statsQuery->clone()->where('device_type', 'tablet')->count(),
                'desktop' => $statsQuery->clone()->where('device_type', 'desktop')->count(),
                'unknown' => $statsQuery->clone()->whereNull('device_type')->count()
            ],
            'hourly' => $statsQuery->clone()
                ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->pluck('count', 'hour')
                ->toArray(),
            'commonActions' => $statsQuery->clone()
                ->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderByDesc('count')
                ->limit(8)
                ->get(),
            'pwa' => [
                'total_launches' => $statsQuery->clone()->where('action', 'app_start')->count(),
                'browser_launches' => $statsQuery->clone()
                    ->where('action', 'app_start')
                    ->whereJsonContains('additional_data->launch_type', 'browser')
                    ->count(),
                'pwa_launches' => $statsQuery->clone()
                    ->where('action', 'app_start')
                    ->whereJsonContains('additional_data->launch_type', 'pwa')
                    ->count(),
                'background_switches' => $statsQuery->clone()->where('action', 'background_switch')->count()
            ],
            'daily' => $statsQuery->clone()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date')
                ->toArray()
        ];

        return Inertia::render('Admin/ActivityLogs', [
            'activities' => $activities,
            'stats' => $stats,
            'users' => $users,
            'zonales' => $zonales,
            'filters' => $request->only(['user_id', 'action', 'date_from', 'date_to', 'zonal_id'])
        ]);
    }

    public function userActivity($userId)
    {
        $user = User::findOrFail($userId);

        $activities = ActivityLog::where('user_id', $userId)
            ->latest()
            ->paginate(20);

        // Estadísticas detalladas del usuario
        $stats = [
            'total_activities' => $user->activityLogs()->count(),
            'last_active' => $user->activityLogs()->latest()->first()?->created_at,
            'first_seen' => $user->activityLogs()->oldest()->first()?->created_at,
            'device_types' => $user->activityLogs()
                ->select('device_type', DB::raw('count(*) as count'))
                ->groupBy('device_type')
                ->get(),
            'most_common_actions' => $user->activityLogs()
                ->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
            'activity_hours' => $user->activityLogs()
                ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
                ->groupBy('hour')
                ->get()
                ->pluck('count', 'hour'),
            'pwa_usage' => [
                'total_launches' => $user->activityLogs()->where('action', 'app_start')->count(),
                'pwa_launches' => $user->activityLogs()
                    ->where('action', 'app_start')
                    ->whereJsonContains('additional_data->launch_type', 'pwa')
                    ->count(),
                'browser_launches' => $user->activityLogs()
                    ->where('action', 'app_start')
                    ->whereJsonContains('additional_data->launch_type', 'browser')
                    ->count(),
            ],
            'most_visited_routes' => $user->activityLogs()
                ->where('action', 'page_view')
                ->select('route', DB::raw('count(*) as visits'))
                ->groupBy('route')
                ->orderByDesc('visits')
                ->limit(5)
                ->get(),
            'daily_activity' => $user->activityLogs()
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderByDesc('date')
                ->limit(30)
                ->get(),
        ];

        return Inertia::render('Admin/UserActivity', [
            'user' => $user,
            'activities' => $activities,
            'stats' => $stats
        ]);
    }

    // Método de exportación actualizado
    public function export(Request $request)
    {
        $query = ActivityLog::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'dni', 'circuit_id')
                        ->with(['circuit' => function ($query) {
                            $query->select('id', 'name', 'zonal_id')
                                ->with('zonal:id,name');
                        }]);
                }
            ]);

        // Aplicar los mismos filtros que en el index
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('zonal_id')) {
            $query->whereHas('user.circuit.zonal', function ($q) use ($request) {
                $q->where('zonals.id', $request->zonal_id);
            });
        }

        $exporter = new ActivityLogsExport($query);
        return $exporter->download();
    }
}
