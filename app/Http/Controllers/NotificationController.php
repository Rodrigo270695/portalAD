<?php

namespace App\Http\Controllers;

use App\Http\Requests\NotificationRequest;
use App\Models\Notification;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Obtener parámetros de la solicitud
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Validar que perPage sea uno de los valores permitidos
        $allowedPerPage = [10, 20, 50, 100];
        $perPage = in_array((int)$perPage, $allowedPerPage) ? (int)$perPage : 10;

        $notifications = Notification::search($search)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return Inertia::render('Notification/Notification/Index', [
            'notifications' => $notifications,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NotificationRequest $request)
    {
        $validated = $request->validated();
        Notification::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notificación creada correctamente']);
        }

        return to_route('notifications.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Notification $notification)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Notification $notification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NotificationRequest $request, Notification $notification)
    {
        $validated = $request->validated();
        $notification->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notificación actualizada correctamente']);
        }

        return to_route('notifications.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return redirect()->route('notifications.index')
            ->with('success', 'Notificación eliminada correctamente');
    }
}
