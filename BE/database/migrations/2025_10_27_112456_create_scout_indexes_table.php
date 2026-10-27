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
        Schema::create('scout_indexes', function (Blueprint $table) {
            $table->id();
            $table->string('indexable_type')->index();
            $table->unsignedBigInteger('indexable_id')->index();
            $table->longText('index');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scout_indexes');
    }
};
