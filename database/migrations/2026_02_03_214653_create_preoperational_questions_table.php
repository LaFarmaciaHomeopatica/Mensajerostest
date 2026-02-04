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
        Schema::create('preoperational_questions', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // e.g., 'Vehículo', 'Seguridad', 'Documentos'
            $table->string('label');    // The question text
            $table->string('key')->unique(); // Computer-readable key (e.g., 'luces')
            $table->boolean('active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preoperational_questions');
    }
};
