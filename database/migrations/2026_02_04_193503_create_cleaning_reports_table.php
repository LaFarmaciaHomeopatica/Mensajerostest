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
        Schema::create('cleaning_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('messenger_id')->constrained()->onDelete('cascade');
            $table->enum('item', ['maleta', 'moto']);
            $table->enum('type', ['semanal_superficial', 'mensual_profunda']);
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cleaning_reports');
    }
};
