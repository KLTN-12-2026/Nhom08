<?php

namespace App\Repositories;

use App\Models\Quote;
use Illuminate\Database\Eloquent\Builder;

class QuoteRepository extends BaseRepository
{
    public function __construct(Quote $model)
    {
        parent::__construct($model);
    }

    public function all(array $params = [])
    {
        $query = $this->model::query();

        // Search
        if (!empty($params['query'])) {
            $searchTerm = $params['query'];
            $query->where('content', 'like', "%{$searchTerm}%");
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
        $sortBy = $params['sort_by'] ?? 'priority';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $params['per_page'] ?? 10;
        $page = $params['page'] ?? null;
        return $query->paginate($perPage, ['*'], 'page', $page);
    }
    /**
     * Get a random quote based on filters.
     */
    public function findRandom(array $params = []): ?Quote
    {
        $query = $this->model::query()->where('is_active', true);

        if (!empty($params['type'])) {
            $query->where('type', $params['type']);
        }
        if (!empty($params['language'])) {
            $query->where('language', $params['language']);
        }
        if (!empty($params['category'])) {
            $query->where('category', $params['category']);
        }
        // Prioritize higher priority values
        $query->orderByDesc('priority');
        // Random order within same priority
        $query->inRandomOrder();

        return $query->first();
    }
}
