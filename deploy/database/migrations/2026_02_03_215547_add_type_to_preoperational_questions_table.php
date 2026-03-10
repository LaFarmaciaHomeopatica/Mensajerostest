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
        Schema::table('preoperational_questions', function (Blueprint $table) {
            $table->string('type')->default('boolean')->after('key'); // boolean (SÍ/NO) o text (Textarea)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('preoperational_questions', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
