<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateCampaignStatus extends Command
{
    protected $signature = 'campaigns:update-status';
    protected $description = 'Update campaign status based on end date';

    public function handle()
    {
        $now = Carbon::now();

        // Actualizar campañas que han expirado
        $updatedCount = Campaign::where('status', true)
            ->where('date_end', '<', $now->startOfDay())
            ->update(['status' => false]);

        $this->info("Se actualizaron {$updatedCount} campañas a estado inactivo.");
    }
}
