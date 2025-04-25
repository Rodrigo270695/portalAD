<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Jenssegers\Agent\Agent;
use Carbon\Carbon;

class ActivityLogService
{
    // Definir constantes para los tipos de actividades
    public const ACTIVITY_PASSWORD_CHANGE = 'password_change';
    public const ACTIVITY_PROFILE_UPDATE = 'profile_update';
    public const ACTIVITY_EXPORT_DATA = 'export_data';
    public const ACTIVITY_IMPORT_DATA = 'import_data';
    public const ACTIVITY_PRINT_REPORT = 'print_report';
    public const ACTIVITY_SEARCH = 'search_performed';
    public const ACTIVITY_FILTER = 'filter_applied';

    private $startTime;

    public function __construct()
    {
        $this->startTime = microtime(true);
    }

    public function log(string $action, ?string $description = null, ?array $additionalData = null): void
    {
        $agent = new Agent();
        $endTime = microtime(true);
        $responseTime = ($endTime - $this->startTime) * 1000; // Convertir a milisegundos

        $data = [
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'device_type' => $this->getDeviceType($agent),
            'app_state' => request()->header('App-State', 'active'),
            'route' => Request::path(),
            'additional_data' => array_merge($additionalData ?? [], [
                'response_time' => round($responseTime, 2),
                'session_start' => session('session_start'),
                'is_weekend' => Carbon::now()->isWeekend(),
                'hour_of_day' => Carbon::now()->hour,
                'day_of_week' => Carbon::now()->dayOfWeek,
                'geo_location' => $this->getGeoLocation(Request::ip()),
                'is_unusual' => $this->isUnusualActivity($action),
            ])
        ];

        ActivityLog::create($data);
    }

    private function getDeviceType(Agent $agent): string
    {
        if ($agent->isPhone()) {
            return 'phone';
        }
        if ($agent->isTablet()) {
            return 'tablet';
        }
        if ($agent->isDesktop()) {
            return 'desktop';
        }
        return 'unknown';
    }

    private function getGeoLocation(string $ip): ?array
    {
        // Implementar integración con servicio de geolocalización
        // Por ahora retornamos null
        return null;
    }

    private function isUnusualActivity(string $action): bool
    {
        $user = Auth::user();
        if (!$user) return false;

        // Verificar patrones inusuales
        $recentActivities = ActivityLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        // Si hay más de 100 actividades en las últimas 24 horas, podría ser inusual
        if ($recentActivities > 100) {
            return true;
        }

        // Verificar si es una hora inusual (fuera de horario laboral)
        $hour = Carbon::now()->hour;
        if ($hour < 6 || $hour > 22) {
            return true;
        }

        return false;
    }

    public function getSessionDuration(): float
    {
        $sessionStart = session('session_start');
        if (!$sessionStart) {
            return 0;
        }

        return Carbon::parse($sessionStart)->diffInMinutes(now());
    }

    public function getAverageResponseTime(): float
    {
        return ActivityLog::where('created_at', '>=', now()->subDay())
            ->whereNotNull('additional_data->response_time')
            ->avg('additional_data->response_time') ?? 0;
    }
}
