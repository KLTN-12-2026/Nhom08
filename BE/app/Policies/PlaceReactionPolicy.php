<?php

namespace App\Policies;

use App\Models\Place;
use App\Models\PlaceReaction;
use App\Models\User;

class PlaceReactionPolicy
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

    public function view(?User $authUser, ?PlaceReaction $reaction = null): bool
    {
        return true;
    }

    public function show(?User $authUser, ?PlaceReaction $reaction = null): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return true;
    }

    public function reactToPlace(User $authUser, Place $place): bool
    {
        return true;
    }

    public function update(User $authUser, PlaceReaction $reaction): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $reaction->user_id;
    }

    public function delete(User $authUser, PlaceReaction $reaction): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $reaction->user_id;
    }

    public function destroy(User $authUser, PlaceReaction $reaction): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $reaction->user_id;
    }
}

