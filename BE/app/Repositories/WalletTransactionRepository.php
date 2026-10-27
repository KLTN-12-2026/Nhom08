<?php

namespace App\Repositories;

use App\Models\WalletTransaction;

class WalletTransactionRepository extends BaseRepository
{
    public function __construct(WalletTransaction $model)
    {
        parent::__construct($model);
    }
}
