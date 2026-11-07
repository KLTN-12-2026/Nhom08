<?php

namespace App\Policies;

use App\Models\Place;
use App\Models\User;

class PlacePolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Place $place): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return true;
    }

    public function update(User $authUser, Place $place): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $place->user_id;
    }

    public function delete(User $authUser, Place $place): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $place->user_id;
    }
}

