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
        Schema::create('audience_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('broadcast_slot_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('audience_estimate');
            $table->date('report_date');
            $table->decimal('rating_points', 4, 2)->nullable();
            $table->decimal('share_percentage', 4, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audience_reports');
    }
};
