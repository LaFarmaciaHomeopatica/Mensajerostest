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
        Schema::table('lunch_logs', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('start_time');
        });

        Schema::table('preoperational_reports', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('created_at');
        });

        Schema::table('cleaning_reports', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('created_at');
        });

        Schema::table('shift_completions', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('created_at');
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('date');
        });

        Schema::table('messengers', function (Blueprint $table) {
            $table->index('is_active');
        });

        Schema::table('internal_procedures', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('dispatch_logs', function (Blueprint $table) {
            $table->index('messenger_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lunch_logs', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['start_time']);
        });

        Schema::table('preoperational_reports', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('cleaning_reports', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('shift_completions', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['date']);
        });

        Schema::table('messengers', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('internal_procedures', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('dispatch_logs', function (Blueprint $table) {
            $table->dropIndex(['messenger_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
