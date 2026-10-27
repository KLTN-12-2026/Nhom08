<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate dữ liệu từ category_id sang bảng pivot
        // Chỉ migrate những place có category_id không null
        DB::statement('
            INSERT INTO category_place (place_id, category_id, created_at, updated_at)
            SELECT id, category_id, created_at, updated_at
            FROM places
            WHERE category_id IS NOT NULL
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa tất cả dữ liệu trong bảng pivot
        DB::table('category_place')->truncate();
    }
};
