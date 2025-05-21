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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['URGENT', 'ALERT'])->comment('Type of notification: URGENT or ALERT');
            $table->string('title')->comment('Title of the notification');
            $table->text('description')->comment('Detailed description of the notification');
            $table->boolean('status')->default(1)->comment('Status of the notification: 1=active, 0=inactive');
            $table->timestamp('start_date')->useCurrent()->comment('When the notification should start showing');
            $table->timestamp('end_date')->nullable()->comment('When the notification should stop showing (optional)');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
