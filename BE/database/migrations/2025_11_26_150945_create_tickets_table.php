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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subject'); // Tiêu đề
            $table->text('description'); // Nội dung chi tiết
            $table->integer('type'); // 0-4: TicketType enum
            $table->string('status')->default('open'); // open, in_progress, resolved, closed
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null'); // Admin xử lý
            $table->text('admin_notes')->nullable(); // Ghi chú nội bộ
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
