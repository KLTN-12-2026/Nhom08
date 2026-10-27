<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('budget', 10, 2);
            $table->decimal('total_estimated', 10, 2);
            $table->json('activities'); // ['food', 'drink', 'activity']
            $table->json('places'); // [1, 4, 9] - Array of place IDs
            $table->json('filters')->nullable(); // {style: 'romantic', distance_km: 5}
            $table->boolean('is_saved')->default(false);
            $table->decimal('actual_cost', 10, 2)->nullable(); // For tracking actual spending
            $table->timestamp('scheduled_at')->nullable(); // When user plans to go
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['user_id', 'created_at'], 'idx_user_date');
            $table->index('created_at', 'idx_created');
            $table->index('is_saved', 'idx_saved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};