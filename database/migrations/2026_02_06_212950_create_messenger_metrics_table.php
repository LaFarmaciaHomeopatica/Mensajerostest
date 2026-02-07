<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messenger_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('messenger_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_plate')->nullable();

            $table->integer('total_routes')->default(0);
            $table->integer('completed_routes')->default(0);
            $table->integer('active_routes')->default(0);
            $table->decimal('avg_time_per_route', 8, 2)->default(0);

            $table->integer('total_deliveries')->default(0);
            $table->integer('successful_deliveries')->default(0);
            $table->integer('failed_deliveries')->default(0);
            $table->integer('on_time_deliveries')->default(0);
            $table->integer('late_deliveries')->default(0);

            $table->decimal('completion_rate', 5, 2)->default(0);
            $table->decimal('on_time_rate', 5, 2)->default(0);

            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['messenger_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messenger_metrics');
    }
};
