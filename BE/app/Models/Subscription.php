<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * Subscription Model (Simplified)
 * 
 * Lưu thông tin subscription của user từ RevenueCat
 */
class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'revenuecat_customer_id',
        'product_id',
        'status',
        'platform',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship: Subscription thuộc về User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check subscription có đang active không
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        // Nếu có expires_at và đã qua -> không active
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Số ngày còn lại đến khi hết hạn
     */
    public function daysRemaining(): ?int
    {
        if (!$this->expires_at) {
            return null; // Lifetime
        }

        return max(0, Carbon::now()->diffInDays($this->expires_at, false));
    }

    /**
     * Tên gói subscription (dễ đọc)
     */
    public function getProductName(): string
    {
        return match($this->product_id) {
            'trove_premium_monthly' => 'Premium Monthly',
            'trove_premium_yearly' => 'Premium Yearly',
            default => $this->product_id,
        };
    }

    /**
     * Scope: Chỉ lấy active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            });
    }
}
