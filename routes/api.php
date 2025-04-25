use App\Services\ActivityLogService;

// ... existing code ...

Route::middleware('auth:sanctum')->post('/log-activity', function (Request $request, ActivityLogService $logger) {
    $logger->log(
        $request->input('action'),
        $request->input('description'),
        $request->input('additional_data')
    );
    return response()->json(['status' => 'success']);
});
