<?php

namespace App\Http\Controllers;

use App\Http\Requests\CampaignRequest;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        // Obtener parámetros de la solicitud
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $year = $request->input('year');
        $month = $request->input('month');

        // Validar que perPage sea uno de los valores permitidos
        $allowedPerPage = [10, 20, 50, 100];
        $perPage = in_array((int)$perPage, $allowedPerPage) ? (int)$perPage : 10;

        $campaigns = Campaign::when($year && $year !== 'all', function ($query, $year) {
                return $query->whereYear('date_start', $year);
            })
            ->when($month && $month !== 'all', function ($query, $month) {
                return $query->whereMonth('date_start', $month);
            })
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'description' => $campaign->description,
                    'type' => $campaign->type,
                    'image_url' => $campaign->image_url,
                    'date_start' => $campaign->date_start->setTimezone('America/Lima')->format('Y-m-d'),
                    'date_end' => $campaign->date_end->setTimezone('America/Lima')->format('Y-m-d'),
                    'date_start_display' => $campaign->date_start->setTimezone('America/Lima')->format('d-m-Y'),
                    'date_end_display' => $campaign->date_end->setTimezone('America/Lima')->format('d-m-Y'),
                    'status' => $campaign->status,
                    'created_at' => $campaign->created_at->setTimezone('America/Lima')->format('d-m-Y H:i:s'),
                ];
            })
            ->withQueryString();

        return Inertia::render('Campaign/Index', [
            'campaigns' => $campaigns,
            'filters' => [
                'year' => $year,
                'month' => $month,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Campaign/Create');
    }

    public function store(CampaignRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('campaigns', 'public');
        }

        Campaign::create($data);

        return redirect()->back()->with('success', 'Campaña creada correctamente');
    }

    public function edit(Campaign $campaign)
    {
        return Inertia::render('Campaign/Edit', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'type' => $campaign->type,
                'image_url' => $campaign->image_url,
                'date_start' => $campaign->date_start->setTimezone('America/Lima')->format('Y-m-d'),
                'date_end' => $campaign->date_end->setTimezone('America/Lima')->format('Y-m-d'),
                'status' => $campaign->status,
            ]
        ]);
    }

    public function update(CampaignRequest $request, Campaign $campaign)
    {
        $data = $request->validated();

        // Manejar la imagen solo si se proporciona una nueva
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            $data['image'] = $request->file('image')->store('campaigns', 'public');
        } else {
            // Si no se proporciona una nueva imagen, mantener la imagen existente
            unset($data['image']);
        }

        $campaign->update($data);

        return redirect()->back()->with('success', 'Campaña actualizada correctamente');
    }

    public function destroy(Campaign $campaign)
    {
        if ($campaign->image) {
            Storage::disk('public')->delete($campaign->image);
        }

        $campaign->delete();

        return redirect()->back()->with('success', 'Campaña eliminada correctamente');
    }
}
