<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class CampaignController extends Controller
{
    public function index()
    {
        return Inertia::render('Campaign/Index');
    }
}
