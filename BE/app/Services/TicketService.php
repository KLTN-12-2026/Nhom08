<?php

namespace App\Services;

use App\Repositories\TicketRepository;

class TicketService extends BaseService
{
    public function __construct(TicketRepository $repository)
    {
        parent::__construct($repository);
    }

    public function getMyTickets(int $userId, array $params = [])
    {
        return $this->repository->findByUser($userId, $params);
    }

    public function getAllTickets(array $params = [])
    {
        return $this->repository->all($params);
    }

    public function updateStatus(int $ticketId, string $status, ?int $adminId = null, ?string $adminNotes = null)
    {
        return $this->repository->updateStatus($ticketId, $status, $adminId, $adminNotes);
    }

    public function assignAdmin(int $ticketId, int $adminId)
    {
        $ticket = $this->repository->find($ticketId);
        if ($ticket) {
            $ticket->update(['admin_id' => $adminId]);
            return $ticket->fresh();
        }
        return null;
    }

    public function updateTicketStatus(int $ticketId, string $status, ?int $adminId = null, ?string $adminNotes = null)
    {
        return $this->repository->updateStatus($ticketId, $status, $adminId, $adminNotes);
    }
}
