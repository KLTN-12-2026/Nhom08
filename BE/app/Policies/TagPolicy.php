<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;

class TagPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Tag $tag): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, Tag $tag): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, Tag $tag): bool
    {
        return $this->isAdmin($authUser);
    }
}

