<?php

namespace App\Policies;

use App\Models\ActivityGroup;
use App\Models\User;

class ActivityGroupPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, ActivityGroup $activityGroup): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, ActivityGroup $activityGroup): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, ActivityGroup $activityGroup): bool
    {
        return $this->isAdmin($authUser);
    }
}

