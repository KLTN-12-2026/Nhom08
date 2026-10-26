<?php

namespace App\Services;

use App\Models\ActivityGroup;
use App\Repositories\ActivityGroupRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * ActivityGroupService - Business logic cho Activity Groups
 * 
 * Service này quản lý:
 * - CRUD operations cho activity groups
 * - Mapping categories vào activity groups (many-to-many)
 */
class ActivityGroupService extends BaseService
{
    public function __construct(ActivityGroupRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Lấy danh sách activity groups với pagination và filters
     * 
     * @param array $params ['search', 'is_active', 'sort_by', 'sort_order', 'per_page']
     * @return LengthAwarePaginator
     */
    public function list(array $params = []): LengthAwarePaginator
    {
        return $this->repository->all($params);
    }

    /**
     * Tạo activity group mới và map categories (nếu có)
     * 
     * Flow:
     * 1. Tạo activity group với data cơ bản (name, key, description...)
     * 2. Nếu có categories → sync vào pivot table
     * 3. Return group kèm categories đã map
     * 
     * @param array $data Data của activity group (name, key, description, display_order, is_active)
     * @param array $categories Danh sách categories cần map [['category_id' => 1, 'subtype_name' => '...', 'display_order' => 1], ...]
     * @return ActivityGroup
     */
    public function createGroup(array $data, array $categories = []): ActivityGroup
    {
        // Bước 1: Tạo activity group mới
        $group = $this->repository->create($data);

        // Bước 2: Map categories nếu có
        if (!empty($categories)) {
            // Sync categories vào pivot table và load relationship
            $group = $this->repository->syncCategories($group, $categories);
        } else {
            // Không có categories, chỉ load empty relationship
            $group->load('categories');
        }

        return $group;
    }

    /**
     * Update activity group và categories (nếu có)
     * 
     * Flow:
     * 1. Update thông tin cơ bản của activity group (name, description...)
     * 2. Reload model để lấy data mới nhất
     * 3. Nếu có categories → sync lại toàn bộ mappings
     * 4. Return group với categories đã update
     * 
     * Note: Categories sync sẽ REPLACE toàn bộ mappings cũ
     * 
     * @param ActivityGroup $group Model cần update
     * @param array $data Data cần update
     * @param array $categories Categories mới cần sync (hoặc empty array để giữ nguyên)
     * @return ActivityGroup
     */
    public function updateGroup(ActivityGroup $group, array $data, array $categories = []): ActivityGroup
    {
        // Bước 1: Update thông tin cơ bản
        $this->repository->update($data, $group->id);
        
        // Bước 2: Reload model để lấy data mới
        $group->refresh();

        // Bước 3: Sync categories nếu được cung cấp
        if (!empty($categories)) {
            // Sync sẽ REPLACE toàn bộ mappings cũ
            return $this->repository->syncCategories($group, $categories);
        }

        // Không có categories trong request → giữ nguyên mappings, chỉ load relationship
        return $group->load('categories');
    }

    /**
     * Sync categories cho activity group
     * 
     * Sync mechanism:
     * - DELETE mappings không có trong array mới
     * - UPDATE mappings đã tồn tại (nếu pivot data thay đổi)
     * - INSERT mappings mới
     * 
     * @param ActivityGroup $group
     * @param array $categories [['category_id' => 1, 'subtype_name' => '...', 'display_order' => 1], ...]
     * @return ActivityGroup Group với categories đã sync
     */
    public function syncCategories(ActivityGroup $group, array $categories): ActivityGroup
    {
        return $this->repository->syncCategories($group, $categories);
    }
}


