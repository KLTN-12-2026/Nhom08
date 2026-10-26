<?php

namespace App\Services;

use App\Repositories\PostRepository;
use App\Models\Post;

class PostService extends BaseService
{
    protected $repository;
    protected $userService;

    public function __construct(PostRepository $repository, UserService $userService)
    {
        $this->repository = $repository;
        $this->userService = $userService;
    }

    /**
     * Create post
     */
    public function create(array $data)
    {
        return parent::create($data);
    }
}
