<?php

namespace App\Policies;

use App\Models\FavoritePlace;
use App\Models\User;

class FavoritePlacePolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function index(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, ?FavoritePlace $favoritePlace = null): bool
    {
        return true;
    }

    public function show(?User $authUser, ?FavoritePlace $favoritePlace = null): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return true;
    }

    public function update(User $authUser, FavoritePlace $favoritePlace): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $favoritePlace->user_id;
    }

    public function delete(User $authUser, FavoritePlace $favoritePlace): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $favoritePlace->user_id;
    }

    public function destroy(User $authUser, FavoritePlace $favoritePlace): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $favoritePlace->user_id;
    }
}

