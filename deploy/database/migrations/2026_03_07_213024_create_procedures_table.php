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
        Schema::create('procedures', function (Blueprint $table) {
            $table->id();
            $table->string('guide')->nullable(); // Column 0
            $table->string('product')->nullable(); // Column 1
            $table->string('quantity')->nullable(); // Column 2
            $table->string('client_id')->nullable(); // Column 3
            $table->string('contact_name')->nullable(); // Column 4
            $table->string('phone')->nullable(); // Column 5
            $table->string('email')->nullable(); // Column 6
            $table->string('address')->nullable(); // Column 7
            $table->string('delivery_window')->nullable(); // Column 8 (horafinal)
            $table->string('priority')->default('Normal'); // Column 9
            $table->text('info')->nullable(); // Column 10

            $table->string('status')->default('pendiente');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('messenger_id')->nullable()->constrained();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procedures');
    }
};
