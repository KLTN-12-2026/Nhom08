<?php

namespace App\Repositories;

use App\Models\ActivityGroup;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * ActivityGroupRepository - Data access layer cho ActivityGroup
 * 
 * Repository này handle:
 * - Query operations với filters/search/pagination
 * - Category sync vào pivot table (activity_group_category)
 */
class ActivityGroupRepository extends BaseRepository
{
    public function __construct(ActivityGroup $model)
    {
        parent::__construct($model);
    }

    /**
     * Lấy danh sách activity groups với filters và pagination
     * 
     * Params support:
     * - search: tìm kiếm theo name, key, description
     * - is_active: filter theo trạng thái (true/false)
     * - sort_by: field cần sort (default: display_order)
     * - sort_order: asc/desc (default: asc)
     * - per_page: số items per page (default: 15)
     * 
     * @param array $params Query parameters
     * @return LengthAwarePaginator
     */
    public function all(array $params = []): LengthAwarePaginator
    {
        // Build base query với eager load categories
        $query = $this->model::query()
            ->with(['categories:id,display_name,name']);

        // Filter 1: Search theo keyword (search trong name, key, description)
        $query->when(!empty($params['search']), function ($q) use ($params) {
            $keyword = $params['search'];
            $q->where(function ($inner) use ($keyword) {
                $inner->where('name', 'like', "%{$keyword}%")
                    ->orWhere('key', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        });

        // Filter 2: Filter theo is_active status
        $query->when(isset($params['is_active']), function ($q) use ($params) {
            $isActive = filter_var($params['is_active'], FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
            $q->where('is_active', $isActive);
        });

        // Sorting: Default sort by display_order ASC (để show theo thứ tự đã set)
        $sortBy = $params['sort_by'] ?? 'display_order';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder)->orderBy('id', 'asc'); // id làm tiebreaker

        // Pagination
        $perPage = (int) ($params['per_page'] ?? 15);
        $perPage = $perPage > 0 ? $perPage : 15; // Ensure positive number

        return $query->paginate($perPage);
    }

    /**
     * Sync categories cho activity group vào pivot table
     * 
     * Pivot table structure: activity_group_category
     * - activity_group_id (FK)
     * - category_id (FK)
     * - subtype_name (extra field - tên phân loại chi tiết)
     * - display_order (extra field - thứ tự hiển thị)
     * 
     * Laravel sync() behavior:
     * 1. DELETE các mappings KHÔNG có trong $syncData
     * 2. UPDATE các mappings đã tồn tại (nếu pivot data thay đổi)
     * 3. INSERT các mappings mới
     * 
     * Example:
     * Before: group có categories [1, 2, 3]
     * Sync với [2, 4] → Result: [2, 4] (xóa 1,3 và thêm 4)
     * 
     * @param ActivityGroup $group Activity group cần sync
     * @param array $categories Format: [['category_id' => 1, 'subtype_name' => '...', 'display_order' => 1], ...]
     * @return ActivityGroup Group với categories đã sync
     */
    public function syncCategories(ActivityGroup $group, array $categories): ActivityGroup
    {
        // Bước 1: Transform array format từ request thành format cho sync()
        // From: [['category_id' => 1, 'subtype_name' => 'X', 'display_order' => 1], ...]
        // To:   [1 => ['subtype_name' => 'X', 'display_order' => 1], ...]
        $syncData = [];

        foreach ($categories as $categoryData) {
            // Skip nếu thiếu category_id
            if (empty($categoryData['category_id'])) {
                continue;
            }

            $categoryId = $categoryData['category_id'];
            
            // Chuẩn bị pivot data (columns trong bảng activity_group_category)
            $pivotData = [
                'subtype_name' => $categoryData['subtype_name'] ?? null,
                'display_order' => $categoryData['display_order'] ?? 0,
            ];

            // Format: [category_id => [pivot_column => value, ...]]
            $syncData[$categoryId] = $pivotData;
        }

        // Bước 2: Thực hiện sync
        if (!empty($syncData)) {
            // Có data → sync categories (Laravel tự động INSERT/UPDATE/DELETE)
            $group->categories()->sync($syncData);
        } else {
            // Empty array → detach tất cả categories
            $group->categories()->detach();
        }

        // Bước 3: Reload categories relationship để return data mới nhất
        return $group->load('categories');
    }
}


