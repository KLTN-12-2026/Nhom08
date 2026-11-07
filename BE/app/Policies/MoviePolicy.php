<?php

namespace App\Policies;

use App\Models\Movie;
use App\Models\User;

class MoviePolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Movie $movie): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, Movie $movie): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, Movie $movie): bool
    {
        return $this->isAdmin($authUser);
    }
}

