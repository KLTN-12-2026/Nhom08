<?php

namespace App\Repositories;

use App\Models\Ticket;

class TicketRepository extends BaseRepository
{
    public function __construct(Ticket $model)
    {
        parent::__construct($model);
    }

    public function all(array $params = [])
    {
        $query = $this->model->newQuery();

        if (isset($params['type']) && $params['type'] !== '' && $params['type'] !== null) {
            $query->where('type', $params['type']);
        }

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        if (!empty($params['sort_by'])) {
            $query->orderBy($params['sort_by'], $params['sort_order'] ?? 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $params['per_page'] ?? 10;
        return $query->paginate($perPage, ['*'], 'page', $params['page'] ?? 1);
    }

    public function findByUser(int $userId, array $params = [])
    {
        $query = $this->model->where('user_id', $userId);

        if (!empty($params['type'])) {
            $query->where('type', $params['type']);
        }

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        if (!empty($params['sort_by'])) {
            $query->orderBy($params['sort_by'], $params['sort_order'] ?? 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $params['per_page'] ?? 10;
        return $query->paginate($perPage);
    }

    public function updateStatus(int $id, string $status, ?int $adminId = null, ?string $adminNotes = null)
    {
        $ticket = $this->find($id);
        if (!$ticket) {
            return null;
        }

        $data = ['status' => $status];
        
        if ($adminId) {
            $data['admin_id'] = $adminId;
        }
        
        if ($adminNotes) {
            $data['admin_notes'] = $adminNotes;
        }

        if ($status === 'resolved' || $status === 'closed') {
            $data['resolved_at'] = now();
        }

        $ticket->update($data);
        return $ticket;
    }
}
