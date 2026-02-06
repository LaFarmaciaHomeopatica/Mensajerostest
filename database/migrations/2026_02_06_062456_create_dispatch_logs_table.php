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
        Schema::create('dispatch_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('messenger_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('dispatch_locations')->cascadeOnDelete();
            $table->string('consecutive');
            $table->integer('guides_count');
            $table->date('date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_logs');
    }
};
