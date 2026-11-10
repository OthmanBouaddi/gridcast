<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('advertising_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advertiser_id')->constrained()->cascadeOnDelete();
            $table->foreignId('broadcast_slot_id')->nullable()->constrained()->nullOnDelete();
            $table->string('campaign_name')->nullable();
            $table->dateTime('broadcast_date')->nullable();
            $table->integer('duration_seconds')->default(30);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('status', ['reserve', 'diffuse', 'annule'])->default('reserve');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertising_slots');
    }
};
