<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Category $category): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, Category $category): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, Category $category): bool
    {
        return $this->isAdmin($authUser);
    }
}

