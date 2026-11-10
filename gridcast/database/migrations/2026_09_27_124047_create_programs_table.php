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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->enum('language', ['ar', 'fr', 'darija'])->default('fr');
            $table->text('synopsis')->nullable();
            $table->integer('duration_minutes')->default(30);
            $table->foreignId('producer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['brouillon', 'soumis', 'valide', 'rejete'])->default('brouillon');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
