<?php

namespace App\Services;

use App\Repositories\TagRepository;

class TagService extends BaseService
{
    protected $repository;

    public function __construct(TagRepository $repository)
    {
        $this->repository = $repository;
    }
}

