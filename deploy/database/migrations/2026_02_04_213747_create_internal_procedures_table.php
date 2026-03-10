<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('internal_procedures', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // TINT00000001
            $table->foreignId('messenger_id')->nullable()->constrained('messengers')->onDelete('set null');
            $table->text('description');
            $table->string('destination_address');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->enum('status', ['created', 'synced', 'failed'])->default('created');
            $table->string('beetrack_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('internal_procedures');
    }
};
