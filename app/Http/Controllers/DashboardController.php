<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display the dashboard view.
     */
    public function index()
    {
        $user = Auth::user();
        $userData = User::with(['zonificador' => function($query) {
            $query->select('id', 'name', 'dni', 'cel');
        }, 'circuit'])->find($user->id);

        return Inertia::render('dashboard', [
            'userData' => [
                'name' => $userData->name,
                'dni' => $userData->dni,
                'vendorName' => $userData->zonificador?->name ?? 'No asignado',
                'vendorDNI' => $userData->zonificador?->dni ?? 'No asignado',
                'vendorPhone' => $userData->zonificador?->cel ?? 'No asignado',
                'channel' => 'PDV',
                'group' => $userData->circuit?->name ?? 'No asignado',
                'updateDate' => $userData->updated_at->format('Y-m-d'),
                'pdvLevel' => 'PDV REGULAR'
            ]
        ]);
    }
}
