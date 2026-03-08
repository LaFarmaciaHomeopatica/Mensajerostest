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
        Schema::table('procedures', function (Blueprint $table) {
            $table->dateTime('start_date')->nullable()->after('address');
            $table->dateTime('end_date')->nullable()->after('start_date');
            $table->dropColumn('delivery_window');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('procedures', function (Blueprint $table) {
            $table->string('delivery_window')->nullable()->after('address');
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};
