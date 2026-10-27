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
        // Sử dụng raw SQL để sửa enum vì Doctrine DBAL có thể gặp lỗi với Enum
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN platform ENUM('ios', 'android', 'sepay') NOT NULL COMMENT 'Platform mua subscription'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN platform ENUM('ios', 'android') NOT NULL COMMENT 'Platform mua subscription'");
    }
};
