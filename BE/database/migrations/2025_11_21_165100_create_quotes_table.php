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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->text('content'); // Nội dung câu nói
            $table->string('type')->index(); // notification, comment_suggestion, tip, greeting, etc.
            $table->string('category')->nullable()->index(); // romantic, funny, motivational, travel, food, etc.
            $table->string('language')->default('vi')->index(); // vi, en
            $table->integer('priority')->default(0); // Độ ưu tiên (số càng cao càng ưu tiên)
            $table->boolean('is_active')->default(true)->index();
            $table->json('metadata')->nullable(); // Thông tin thêm: author, source, tags, etc.
            $table->integer('usage_count')->default(0); // Đếm số lần sử dụng
            $table->timestamp('last_used_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
