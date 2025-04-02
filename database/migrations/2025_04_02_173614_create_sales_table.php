<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales', callback: function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('cluster_quality','50')->nullable();
            $table->date('recharge_date')->nullable();
            $table->integer('recharge_amount')->nullable();
            $table->integer('accumulated_amount')->nullable();
            $table->boolean('commissionable_charge');
            $table->string('action','20')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('webproduct_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
