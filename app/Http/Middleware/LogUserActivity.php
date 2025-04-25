<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\ActivityLogService;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    protected $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->ajax()) {
            return $response;
        }

        $this->activityLogService->log(
            'page_view',
            'Usuario visitó ' . $request->path(),
            [
                'method' => $request->method(),
                'referer' => $request->header('referer'),
                'is_pwa' => $request->header('Service-Worker-Navigation-Preload', false) ? true : false
            ]
        );

        return $response;
    }
}
