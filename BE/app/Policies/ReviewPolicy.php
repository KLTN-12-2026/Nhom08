<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
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

    public function view(?User $authUser, ?Review $review = null): bool
    {
        return true;
    }

    public function show(?User $authUser, ?Review $review = null): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return true;
    }

    public function update(User $authUser, Review $review): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $review->user_id;
    }

    public function delete(User $authUser, Review $review): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $review->user_id;
    }

    public function destroy(User $authUser, Review $review): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $review->user_id;
    }
}

