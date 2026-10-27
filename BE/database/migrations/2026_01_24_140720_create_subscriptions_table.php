<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tạo bảng subscriptions đơn giản để lưu thông tin premium của user
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            
            // User ID
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('User sở hữu subscription');
            
            // RevenueCat customer ID (app_user_id)
            $table->string('revenuecat_customer_id')
                ->index()
                ->comment('Customer ID từ RevenueCat');
            
            // Product ID (trove_premium_monthly, trove_premium_yearly, etc.)
            $table->string('product_id')
                ->comment('ID của gói premium');
            
            // Status: active, expired, cancelled
            $table->enum('status', ['active', 'expired', 'cancelled'])
                ->default('active')
                ->comment('Trạng thái subscription');
            
            // Platform: ios, android
            $table->enum('platform', ['ios', 'android'])
                ->comment('Platform mua subscription');
            
            // Expiry date
            $table->timestamp('expires_at')
                ->nullable()
                ->comment('Thời điểm hết hạn (null = lifetime)');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
