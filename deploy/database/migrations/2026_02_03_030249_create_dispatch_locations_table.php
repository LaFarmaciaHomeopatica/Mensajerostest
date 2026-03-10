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
        Schema::create('dispatch_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., bodega1
            $table->string('address');
            $table->string('prefix'); // e.g., B1
            $table->integer('current_consecutive')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_locations');
    }
};
