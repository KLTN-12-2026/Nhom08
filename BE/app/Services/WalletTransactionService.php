<?php

namespace App\Services;

use App\Repositories\WalletTransactionRepository;

class WalletTransactionService extends BaseService
{
    protected $repository;

    public function __construct(WalletTransactionRepository $repository)
    {
        $this->repository = $repository;
    }
}
