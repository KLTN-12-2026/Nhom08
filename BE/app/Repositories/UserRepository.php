<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * Find user by RevenueCat customer ID
     * 
     * Dùng khi nhận webhook từ RevenueCat
     * RevenueCat gửi app_user_id (revenuecat_customer_id)
     * 
     * @param string $customerId
     * @return User|null
     */
    public function findByRevenueCatCustomerId(string $customerId): ?User
    {
        return User::where('revenuecat_customer_id', $customerId)->first();
    }
}