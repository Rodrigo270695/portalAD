<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Payment/Index');
    }
}
