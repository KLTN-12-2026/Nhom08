<?php

namespace App\Services;

use App\Repositories\FriendshipRepository;

class FriendshipService extends BaseService
{
    protected $repository;

    public function __construct(FriendshipRepository $repository)
    {
        $this->repository = $repository;
    }
}
