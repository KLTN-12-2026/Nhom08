<?php

namespace App\Repositories;

use App\Models\Tag;

class TagRepository extends BaseRepository
{
    public function __construct(Tag $model)
    {
        parent::__construct($model);
    }

    public function all(array $params = [])
    {
        $query = $this->model::query();

        // Search
        if (!empty($params['query'])) {
            $searchTerm = $params['query'];
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        // Filters
        if (!empty($params['filters']) && is_array($params['filters'])) {
            foreach ($params['filters'] as $field => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($field, $value);
                }
            }
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $params['per_page'] ?? 10;
        $page = $params['page'] ?? null;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}

