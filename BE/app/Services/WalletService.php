<?php

namespace App\Services;

use App\Repositories\WalletRepository;

class WalletService extends BaseService
{
    protected $repository;

    public function __construct(WalletRepository $repository)
    {
        $this->repository = $repository;
    }
}
