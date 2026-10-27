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
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->integer('moveek_id')->unique()->comment('ID from Moveek website');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('poster')->nullable();
            $table->string('release_date')->nullable();
            $table->string('rating')->nullable();
            $table->json('genres')->nullable();
            $table->string('language')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
