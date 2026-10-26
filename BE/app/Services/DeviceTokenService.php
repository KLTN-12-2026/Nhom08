<?php

namespace App\Services;

use App\Repositories\DeviceTokenRepository;

class DeviceTokenService extends BaseService
{
    protected $repository;

    public function __construct(DeviceTokenRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get device tokens for a user.
     */
    public function getTokensByUser(int $userId, bool $onlyActive = true): array
    {
        return $this->repository->getTokensByUser($userId, $onlyActive);
    }
}
