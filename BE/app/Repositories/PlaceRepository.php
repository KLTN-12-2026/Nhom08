<?php

namespace App\Repositories;

use App\Enums\PlaceStatusEnum;
use App\Models\Place;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class PlaceRepository extends BaseRepository
{
    public function __construct(Place $model)
    {
        parent::__construct($model);
    }

    public function all(array $params = []): LengthAwarePaginator
    {
        return $this->queryWithFilters($params);
    }

    protected function queryWithFilters(array $params): LengthAwarePaginator
    {
        // Eager load relationships
        // - categories.activityGroups: for filtering and display
        // - media: place images
        // - user: place creator/owner (especially useful for admin)
        $query = $this->model::query()->with(['categories.activityGroups', 'media', 'user']);

        // Direct status filter (e.g., ?status=1 or ?status=0,1,2)
        if (isset($params['status']) && $params['status'] !== '') {
            $status = $params['status'];
            if (is_string($status) && str_contains($status, ',')) {
                $status = explode(',', $status);
            }
            
            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        } 
        // By default, only show approved places for public API (when status not explicitly set)
        // Admin can bypass this with admin_view=true or by setting status explicitly
        elseif (!isset($params['admin_view']) || !$params['admin_view']) {
            $query->where('status', PlaceStatusEnum::APPROVED->value);
        }

        $this->applySearch($query, $params);
        $this->applyPriceFilter($query, $params);
        $this->applyCategoryFilter($query, $params);
        $this->applyActivityGroupFilter($query, $params);
        $this->applyTagFilter($query, $params);
        $this->applyGenericFilters($query, $params);
        $distanceSelected = $this->applyDistanceFilter($query, $params);

        [$sortBy, $sortOrder] = $this->resolveSort($params, $distanceSelected);
        $query->orderBy($sortBy, $sortOrder);

        $perPage = (int) ($params['per_page'] ?? 20);
        $perPage = $perPage > 0 ? $perPage : 20;
        $page = $params['page'] ?? null;

        // Apply max results limit if set
        $maxResults = isset($params['max_results']) ? (int) $params['max_results'] : null;
        
        if ($maxResults !== null && $maxResults > 0) {
            // Get total count before limiting
            $total = $query->count();
            
            // If total exceeds max results, limit it
            if ($total > $maxResults) {
                // Calculate max page based on max results
                $maxPage = (int) ceil($maxResults / $perPage);
                
                // Adjust page if it exceeds max page
                if ($page !== null && $page > $maxPage) {
                    $page = $maxPage;
                }
                
                // Apply limit to query - this will limit the total results
                // We need to clone the query to get count, then apply limit
                $limitedQuery = clone $query;
                $limitedQuery->limit($maxResults);
                
                // Paginate with the limited query, but adjust total
                $paginator = $limitedQuery->paginate($perPage, ['*'], 'page', $page);
             
                
                return $paginator;
            }
        }

        // Get total count to calculate last page
        $total = $query->count();
        $lastPage = $total > 0 ? (int) ceil($total / $perPage) : 1;
        
        // Adjust page if it exceeds last page (redirect to last page)
        if ($page !== null && $page > $lastPage && $lastPage > 0) {
            $page = $lastPage;
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    protected function applySearch(Builder $query, array $params): void
    {
        $searchTerm = $params['query'] ?? $params['search'] ?? null;
        
        if (empty($searchTerm)) {
            return;
        }


        $query->where(function (Builder $q) use ($searchTerm) {
            $like = '%' . $searchTerm . '%';
            $q->where('name', 'like', $like)
              ->orWhere('address', 'like', $like)
              ->orWhere('description', 'like', $like)
              ->orWhere('contact_phone', 'like', $like)
              ->orWhere('contact_email', 'like', $like);
        });
    }

    protected function applyPriceFilter(Builder $query, array $params): void
    {
        if (!empty($params['price_min'])) {
            $query->where('average_price', '>=', (float) $params['price_min']);
        }

        if (!empty($params['price_max'])) {
            $query->where('average_price', '<=', (float) $params['price_max']);
        }
    }

    protected function applyCategoryFilter(Builder $query, array $params): void
    {
        $categoryIds = $this->normalizeToArray($params['category_ids'] ?? Arr::get($params, 'filters.category_ids'));

        if (empty($categoryIds)) {
            return;
        }

        $query->whereHas('categories', function (Builder $q) use ($categoryIds) {
            $q->whereIn('categories.id', $categoryIds);
        });
    }

    protected function applyActivityGroupFilter(Builder $query, array $params): void
    {
        $activityGroupIds = $this->normalizeToArray($params['activity_group_ids'] ?? null);

        if (empty($activityGroupIds)) {
            return;
        }

        $query->whereHas('activityGroups', function (Builder $q) use ($activityGroupIds) {
            $q->whereIn('activity_groups.id', $activityGroupIds)
              ->where('activity_groups.is_active', true);
        });
    }

    protected function applyTagFilter(Builder $query, array $params): void
    {
        $tagIds = $this->normalizeToArray($params['tag_ids'] ?? Arr::get($params, 'filters.tag_ids'));

        if (empty($tagIds) && !empty($params['tags'])) {
            $tagIds = Tag::whereIn('name', $this->normalizeToArray($params['tags']))
                ->pluck('id')
                ->all();
        }

        if (empty($tagIds)) {
            return;
        }

        $query->where(function (Builder $q) use ($tagIds) {
            foreach ($tagIds as $tagId) {
                $q->orWhereJsonContains('tag_ids', (int) $tagId);
            }
        });
    }

    protected function applyGenericFilters(Builder $query, array $params): void
    {
        if (empty($params['filters']) || !is_array($params['filters'])) {
            return;
        }

        // List of fields that should not be applied as direct where clauses
        // These are handled by specific filter methods
        $excludedFields = [
            'category_id',      // Singular - not a column in places table
            'category_ids',     // Plural - handled by applyCategoryFilter
            'tag_ids',          // Handled by applyTagFilter
            'tags',             // Handled by applyTagFilter
        ];

        foreach ($params['filters'] as $field => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            if (in_array($field, $excludedFields, true)) {
                continue;
            }

            $query->where($field, $value);
        }
    }

    protected function applyDistanceFilter(Builder $query, array $params): bool
    {
        $latitude = $params['latitude'] ?? null;
        $longitude = $params['longitude'] ?? null;

        if ($latitude === null || $longitude === null) {
            return false;
        }

        $latitude = (float) $latitude;
        $longitude = (float) $longitude;
        $distanceKm = isset($params['distance_km']) ? (float) $params['distance_km'] : null;

        $distanceExpression = '(
            6371 * acos(
                cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))
            )
        )';

        $query->select('places.*');
        $query->selectRaw("{$distanceExpression} as distance", [$latitude, $longitude, $latitude]);

        if ($distanceKm !== null && $distanceKm > 0) {
            $query->whereRaw("{$distanceExpression} <= ?", [$latitude, $longitude, $latitude, $distanceKm]);
        }

        return true;
    }

    protected function resolveSort(array $params, bool $distanceSelected): array
    {
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';

        $allowedSorts = ['average_price', 'rating', 'created_at', 'updated_at', 'name'];

        if ($distanceSelected) {
            $allowedSorts[] = 'distance';
        }

        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortOrder, ['asc', 'desc'], true)) {
            $sortOrder = 'desc';
        }

        return [$sortBy, $sortOrder];
    }

    protected function normalizeToArray($value): array
    {
        if (empty($value)) {
            return [];
        }

        if (is_array($value)) {
            return array_filter($value, fn ($item) => $item !== null && $item !== '');
        }

        if (is_string($value)) {
            return array_filter(array_map('trim', explode(',', $value)));
        }

        return [(int) $value];
    }
}
