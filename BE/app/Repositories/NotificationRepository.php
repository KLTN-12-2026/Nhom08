<?php

namespace App\Repositories;

use App\Models\Notification;

class NotificationRepository extends BaseRepository
{
    public function __construct(Notification $model)
    {
        parent::__construct($model);
    }

    public function all(array $params = [])
    {
        $builder = $this->model::query()->with('user');

        if (!empty($params['query'])) {
            $keyword = '%' . $params['query'] . '%';
            $builder->where(function ($q) use ($keyword) {
                $q->where('title', 'like', $keyword)
                  ->orWhere('message', 'like', $keyword);
            });
        }

        if (!empty($params['filters']) && is_array($params['filters'])) {
            foreach ($params['filters'] as $field => $value) {
                if ($value !== null && $value !== '') {
                    $builder->where($field, $value);
                }
            }
        }

        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $builder->orderBy($sortBy, $sortOrder);

        $perPage = $params['per_page'] ?? 10;
        $page = $params['page'] ?? 1;

        return $builder->paginate($perPage, ['*'], 'page', $page);
    }
}

