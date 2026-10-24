<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Thêm các fields liên quan đến premium vào users table
     * để có thể check premium status nhanh mà không cần join với subscriptions table
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Flag cho biết user có premium không
            // Cached value để check nhanh, được update khi subscription thay đổi
            // Index: để query nhanh "Lấy tất cả premium users"
            $table->boolean('is_premium')
                ->default(false)
                ->after('email_verified_at')
                ->index()
                ->comment('User có premium membership không (cached value)');
            
            // Thời điểm premium hết hạn
            // Nullable: nếu không premium thì null
            // Được update khi subscription thay đổi
            $table->timestamp('premium_until')
                ->nullable()
                ->after('is_premium')
                ->comment('Thời điểm premium membership hết hạn');
            
            // RevenueCat customer ID của user
            // Unique: mỗi user chỉ có 1 RevenueCat customer ID
            // Dùng để sync subscription từ RevenueCat
            $table->string('revenuecat_customer_id')
                ->nullable()
                ->unique()
                ->after('premium_until')
                ->comment('RevenueCat customer ID (app_user_id)');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Xóa các premium fields khỏi users table
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop các columns đã thêm
            $table->dropColumn([
                'is_premium',
                'premium_until',
                'revenuecat_customer_id'
            ]);
        });
    }
};
