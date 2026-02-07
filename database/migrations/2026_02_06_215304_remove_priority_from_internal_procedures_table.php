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
        Schema::table('internal_procedures', function (Blueprint $table) {
            $table->dropColumn('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internal_procedures', function (Blueprint $table) {
            $table->string('priority')->default('Normal');
        });
    }
};
