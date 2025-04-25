<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\ActivityLogService;
use Symfony\Component\HttpFoundation\Response;

class LogFileDownloads
{
    protected $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response->headers->has('Content-Disposition') &&
            strpos($response->headers->get('Content-Disposition'), 'attachment') !== false) {

            $filename = '';
            if (preg_match('/filename="([^"]+)"/', $response->headers->get('Content-Disposition'), $matches)) {
                $filename = $matches[1];
            }

            $this->activityLogService->log(
                'file_download',
                'Usuario descargó un archivo',
                [
                    'filename' => $filename,
                    'content_type' => $response->headers->get('Content-Type'),
                    'size' => $response->headers->get('Content-Length'),
                    'route' => $request->path()
                ]
            );
        }

        return $response;
    }
}
