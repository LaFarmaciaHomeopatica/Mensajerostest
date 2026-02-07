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
            $table->string('item_name')->nullable()->after('description');
            $table->integer('item_quantity')->default(1)->after('item_name');
            $table->string('item_code')->nullable()->after('item_quantity');
            $table->string('contact_identifier')->nullable()->after('item_code');
            $table->string('latitude')->nullable()->after('contact_email');
            $table->string('longitude')->nullable()->after('latitude');
            $table->timestamp('min_delivery_at')->nullable()->after('longitude');
            $table->timestamp('max_delivery_at')->nullable()->after('min_delivery_at');
            $table->string('destination_city')->nullable()->after('destination_address');
            $table->string('priority')->default('Normal')->after('destination_city');
            $table->text('observations')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internal_procedures', function (Blueprint $table) {
            $table->dropColumn([
                'item_name',
                'item_quantity',
                'item_code',
                'contact_identifier',
                'latitude',
                'longitude',
                'min_delivery_at',
                'max_delivery_at',
                'destination_city',
                'priority',
                'observations',
            ]);
        });
    }
};
