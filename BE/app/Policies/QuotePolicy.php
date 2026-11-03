<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Quote $quote): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, Quote $quote): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, Quote $quote): bool
    {
        return $this->isAdmin($authUser);
    }
}

