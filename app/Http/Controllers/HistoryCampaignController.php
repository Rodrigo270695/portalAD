<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryCampaignController extends Controller
{
    public function index(Request $request)
    {
        $now = now();
        $year = $request->input('year', (string)$now->year);
        $month = $request->input('month', str_pad($now->month, 2, '0', STR_PAD_LEFT));

        // Obtener campañas agrupadas por tipo
        $campaigns = Campaign::query()
            ->when($year !== 'all', function ($query) use ($year) {
                return $query->whereYear('date_start', $year);
            })
            ->when($month !== 'all', function ($query) use ($month) {
                return $query->whereMonth('date_start', $month);
            })
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'type' => $campaign->type,
                    'image_url' => $campaign->image_url,
                    'date_start_display' => Carbon::parse($campaign->date_start)->format('d/m/Y'),
                    'date_end_display' => Carbon::parse($campaign->date_end)->format('d/m/Y'),
                    'status' => $campaign->status,
                ];
            })
            ->groupBy('type');

        // Preparar datos para la vista
        $campaignsByType = [
            'Esquema' => $campaigns->get('Esquema', collect()),
            'Acelerador' => $campaigns->get('Acelerador', collect()),
            'Información' => $campaigns->get('Información', collect()),
        ];

        // Años disponibles (últimos 10 años)
        $availableYears = range(now()->year, now()->year - 9);

        // Meses disponibles
        $availableMonths = [
            ['value' => '01', 'label' => 'Enero'],
            ['value' => '02', 'label' => 'Febrero'],
            ['value' => '03', 'label' => 'Marzo'],
            ['value' => '04', 'label' => 'Abril'],
            ['value' => '05', 'label' => 'Mayo'],
            ['value' => '06', 'label' => 'Junio'],
            ['value' => '07', 'label' => 'Julio'],
            ['value' => '08', 'label' => 'Agosto'],
            ['value' => '09', 'label' => 'Septiembre'],
            ['value' => '10', 'label' => 'Octubre'],
            ['value' => '11', 'label' => 'Noviembre'],
            ['value' => '12', 'label' => 'Diciembre'],
        ];

        return Inertia::render('Campaign/History', [
            'campaignsByType' => $campaignsByType,
            'currentYear' => $year,
            'currentMonth' => $month,
            'availableYears' => $availableYears,
            'availableMonths' => $availableMonths,
        ]);
    }
}