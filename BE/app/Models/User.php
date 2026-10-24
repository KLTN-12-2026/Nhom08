<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'name',
        'password',
        'hashed_password',
        'is_active',
        'is_blocked',
        'role',
        'gender',
        'phone_number',
        'avatar',
        'refresh_token',
        'refresh_token_expires_at',
        'subscription_tier',
        // RevenueCat IAP fields
        'is_premium',
        'premium_until',
        'revenuecat_customer_id',
    ];

    protected $hidden = [
        'password',
        'hashed_password',
        'remember_token',
        'refresh_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_blocked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // RevenueCat IAP casts
        'is_premium' => 'boolean',
        'premium_until' => 'datetime',
    ];

    // Relationships
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function places()
    {
        return $this->hasMany(Place::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function favoritePlaces()
    {
        return $this->hasMany(FavoritePlace::class);
    }

    public function sentFriendships()
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    public function receivedFriendships()
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function plans()
{
    return $this->hasMany(Plan::class);
}

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }

    public function deviceTokens()
    {
        return $this->hasMany(DeviceToken::class);
    }

    /*
    |--------------------------------------------------------------------------
    | RevenueCat Subscription Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Get all subscriptions của user
     * 
     * Relationship: User has many Subscriptions
     * Include cả active và expired subscriptions
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active subscription hiện tại của user
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->latest();
    }

    /*
    |--------------------------------------------------------------------------
    | Premium Helper Methods (RevenueCat)
    |--------------------------------------------------------------------------
    */

    /**
     * Check if user has premium membership (RevenueCat)
     * 
     * Kiểm tra premium status từ cached field is_premium
     * Performance: Nhanh vì không cần query subscriptions table
     * 
     * @return bool
     */
    public function isPremium(): bool
    {
        // Check cached premium status
        if (!$this->is_premium) {
            return false;
        }

        // Double check với premium_until nếu có
        if ($this->premium_until && $this->premium_until->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if user has premium membership (with database verification)
     * 
     * Verify premium status bằng cách check subscription trong database
     * Slower nhưng accurate hơn isPremium()
     * 
     * @return bool
     */
    public function hasPremiumSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    /**
     * Get premium expiry date
     * 
     * Lấy thông tin khi nào premium hết hạn
     * Return null nếu không có premium
     * 
     * @return \Carbon\Carbon|null
     */
    public function premiumExpiresAt(): ?\Carbon\Carbon
    {
        return $this->premium_until;
    }

    /**
     * Get days until premium expires
     * 
     * Tính số ngày còn lại của premium membership
     * Return 0 nếu đã hết hạn
     * Return null nếu không có premium hoặc lifetime premium
     * 
     * @return int|null
     */
    public function daysUntilExpiry(): ?int
    {
        if (!$this->premium_until) {
            return null;
        }

        return max(0, now()->diffInDays($this->premium_until, false));
    }

    /**
     * Check if premium is expiring soon (default 3 days)
     * 
     * Kiểm tra premium sắp hết hạn để notify user
     * 
     * @param int $days
     * @return bool
     */
    public function isPremiumExpiringSoon(int $days = 3): bool
    {
        if (!$this->isPremium() || !$this->premium_until) {
            return false;
        }

        $daysRemaining = $this->daysUntilExpiry();
        return $daysRemaining !== null && $daysRemaining <= $days && $daysRemaining > 0;
    }

    /**
     * Update premium status from active subscription
     * 
     * Sync cached premium fields (is_premium, premium_until) từ subscriptions table
     * Gọi method này sau khi subscription thay đổi (webhook, restore, etc.)
     * 
     * @return void
     */
    public function updatePremiumStatus(): void
    {
        $activeSubscription = $this->activeSubscription;

        if ($activeSubscription && $activeSubscription->isActive()) {
            $this->update([
                'is_premium' => true,
                'premium_until' => $activeSubscription->expires_at,
            ]);
        } else {
            $this->update([
                'is_premium' => false,
                'premium_until' => null,
            ]);
        }
    }

    /**
     * Get premium status summary
     * 
     * Lấy tất cả thông tin về premium status
     * Useful cho API response
     * 
     * @return array
     */
    public function getPremiumStatusSummary(): array
    {
        $activeSubscription = $this->activeSubscription;

        return [
            'is_premium' => $this->isPremium(),
            'premium_until' => $this->premium_until?->toIso8601String(),
            'days_remaining' => $this->daysUntilExpiry(),
            'active_subscription' => $activeSubscription ? [
                'product_id' => $activeSubscription->product_id,
                'product_name' => $activeSubscription->getProductName(),
                'platform' => $activeSubscription->platform,
                'status' => $activeSubscription->status,
                'expires_at' => $activeSubscription->expires_at?->toIso8601String(),
            ] : null,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Legacy Subscription Methods (Backward Compatibility)
    |--------------------------------------------------------------------------
    */

    /**
     * Check if user has specific tier (legacy)
     * 
     * @deprecated Use isPremium() instead
     */
    public function hasTier(string $tier): bool
    {
        return $this->subscription_tier === $tier;
    }

    /**
     * Check if user has at least the specified tier (legacy)
     * 
     * @deprecated Use isPremium() instead
     */
    public function hasMinimumTier(string $tier): bool
    {
        $hierarchy = ['free' => 0, 'pro' => 1, 'enterprise' => 2];
        
        $userLevel = $hierarchy[$this->subscription_tier] ?? 0;
        $requiredLevel = $hierarchy[$tier] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }

    /**
     * Get subscription tier display name (legacy)
     * 
     * @deprecated Use getPremiumStatusSummary() instead
     */
    public function getTierNameAttribute(): string
    {
        return match($this->subscription_tier) {
            'free' => 'Free',
            'pro' => 'Pro',
            'enterprise' => 'Enterprise',
            default => 'Unknown'
        };
    }
}