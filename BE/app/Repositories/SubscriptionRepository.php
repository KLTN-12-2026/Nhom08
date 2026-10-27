<?php

namespace App\Repositories;

use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;

/**
 * Subscription Repository (Simplified)
 * 
 * Data Access Layer cho Subscription - chỉ những methods cần thiết
 */
class SubscriptionRepository
{
    /**
     * Find active subscription by user ID
     */
    public function findByUserId(int $userId): ?Subscription
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->latest()
            ->first();
    }

    /**
     * Find subscription by RevenueCat customer ID
     */
    public function findByRevenueCatCustomerId(string $customerId): ?Subscription
    {
        return Subscription::where('revenuecat_customer_id', $customerId)
            ->where('status', 'active')
            ->latest()
            ->first();
    }

    /**
     * Get all subscriptions of user (bao gồm cả expired)
     */
    public function getUserSubscriptions(int $userId): Collection
    {
        return Subscription::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create or update subscription
     */
    public function createOrUpdate(array $data): Subscription
    {
        return Subscription::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'revenuecat_customer_id' => $data['revenuecat_customer_id'],
            ],
            $data
        );
    }

    /**
     * Update subscription status
     */
    public function updateStatus(int $subscriptionId, string $status): bool
    {
        return Subscription::where('id', $subscriptionId)
            ->update(['status' => $status]);
    }
}
