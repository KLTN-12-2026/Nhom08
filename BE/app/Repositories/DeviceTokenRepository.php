<?php

namespace App\Repositories;

use App\Models\DeviceToken;

class DeviceTokenRepository extends BaseRepository
{
    public function __construct(DeviceToken $model)
    {
        parent::__construct($model);
    }

    /**
     * Get tokens for a user (optionally only active).
     */
    public function getTokensByUser(int $userId, bool $onlyActive = true): array
    {
        $query = $this->model->where('user_id', $userId);
        if ($onlyActive) {
            $query->where('is_active', true);
        }
        return $query->pluck('token')->toArray();
    }
}
