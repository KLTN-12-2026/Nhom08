<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(?User $authUser): bool
    {
        return true;
    }

    public function view(?User $authUser, Notification $notification): bool
    {
        return true;
    }

    public function index(User $authUser): bool
    {
        return true;
    }

    public function show(User $authUser): bool
    {
        return true;
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, ?Notification $notification = null): bool
    {
        return $this->isAdmin($authUser);
    }

    public function destroy(User $authUser, ?Notification $notification = null): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, ?Notification $notification = null): bool
    {
        return $this->isAdmin($authUser);
    }
}

