<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function view(User $authUser, Ticket $ticket): bool
    {
        return $this->isAdmin($authUser) || $authUser->id === $ticket->user_id;
    }

    public function update(User $authUser, Ticket $ticket): bool
    {
        return $this->isAdmin($authUser);
    }

    public function assign(User $authUser, Ticket $ticket): bool
    {
        return $this->isAdmin($authUser);
    }

    public function delete(User $authUser, Ticket $ticket): bool
    {
        return $this->isAdmin($authUser);
    }
}

