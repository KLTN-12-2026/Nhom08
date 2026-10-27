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
        Schema::create('configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Config key (e.g., user_limits.places_view_limits.0)');
            $table->text('value')->nullable()->comment('Config value (stored as JSON or text)');
            $table->string('type')->default('string')->comment('Value type: string, integer, boolean, json, array');
            $table->string('group')->index()->comment('Config group (e.g., user_limits, system)');
            $table->text('description')->nullable()->comment('Description of this config');
            $table->boolean('is_active')->default(true)->comment('Whether this config is active');
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['group', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configs');
    }
};
