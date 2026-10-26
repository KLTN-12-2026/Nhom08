<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreActivityGroupRequest;
use App\Http\Requests\Admin\SyncActivityGroupCategoriesRequest;
use App\Http\Requests\Admin\UpdateActivityGroupRequest;
use App\Http\Resources\Admin\ActivityGroupResource;
use App\Http\Resources\PaginationResource;
use App\Models\ActivityGroup;
use App\Services\ActivityGroupService;
use Illuminate\Http\Request;

class ActivityGroupController extends Controller
{
    protected ActivityGroupService $service;

    public function __construct(ActivityGroupService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/activity-groups",
     *     tags={"Admin - Activity Groups"},
     *     summary="List activity groups",
     *     description="Retrieve activity groups with filters, pagination and categories.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="is_active", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request)
    {
        $groups = $this->service->list($request->only([
            'search',
            'is_active',
            'sort_by',
            'sort_order',
            'per_page',
        ]));

        return $this->response(
            new PaginationResource(ActivityGroupResource::collection($groups))
        );
    }

    /**
     * @OA\Post(
     *     path="/api/admin/activity-groups",
     *     tags={"Admin - Activity Groups"},
     *     summary="Create activity group",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"key","name"},
     *             @OA\Property(property="key", type="string", example="food"),
     *             @OA\Property(property="name", type="string", example="Ăn uống"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="display_order", type="integer", example=1),
     *             @OA\Property(
     *                 property="categories",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="category_id", type="integer", example=1),
     *                     @OA\Property(property="subtype_name", type="string", example="Nhà hàng"),
     *                     @OA\Property(property="display_order", type="integer", example=1)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(StoreActivityGroupRequest $request)
    {
        $data = $request->validated();
        $categories = $data['categories'] ?? [];
        unset($data['categories']);

        $group = $this->service->createGroup($data, $categories);

        return $this->response(
            new ActivityGroupResource($group),
            'Activity group created successfully',
            201
        );
    }

    /**
     * @OA\Get(
     *     path="/api/admin/activity-groups/{id}",
     *     tags={"Admin - Activity Groups"},
     *     summary="Show activity group",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(ActivityGroup $activityGroup)
    {
        $activityGroup->load('categories');

        return $this->response(new ActivityGroupResource($activityGroup));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/activity-groups/{id}",
     *     tags={"Admin - Activity Groups"},
     *     summary="Update activity group",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="display_order", type="integer"),
     *             @OA\Property(property="categories", type="array", @OA\Items(
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="subtype_name", type="string"),
     *                 @OA\Property(property="display_order", type="integer")
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(UpdateActivityGroupRequest $request, ActivityGroup $activityGroup)
    {
        $data = $request->validated();
        $categories = $data['categories'] ?? [];
        unset($data['categories']);

        $group = $this->service->updateGroup($activityGroup, $data, $categories);

        return $this->response(
            new ActivityGroupResource($group),
            'Activity group updated successfully'
        );
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/activity-groups/{id}",
     *     tags={"Admin - Activity Groups"},
     *     summary="Delete activity group",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Deleted")
     * )
     */
    public function destroy(ActivityGroup $activityGroup)
    {
        $activityGroup->categories()->detach();
        $activityGroup->delete();

        return $this->response(null, 'Activity group deleted successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/admin/activity-groups/{id}/categories",
     *     tags={"Admin - Activity Groups"},
     *     summary="Sync categories for group",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"categories"},
     *             @OA\Property(
     *                 property="categories",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="category_id", type="integer"),
     *                     @OA\Property(property="subtype_name", type="string"),
     *                     @OA\Property(property="display_order", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Synced")
     * )
     */
    public function syncCategories(SyncActivityGroupCategoriesRequest $request, ActivityGroup $activityGroup)
    {
        /**
         * Flow:
         * 1. Validate request data (đã validate bởi SyncActivityGroupCategoriesRequest)
         * 2. Extract categories array từ validated data
         * 3. Gọi service để sync categories vào pivot table
         * 4. Return response với activity group + categories đã sync
         * 
         * Sync logic (trong service/repository):
         * - DELETE mappings không có trong request
         * - UPDATE mappings đã tồn tại (nếu pivot data thay đổi)
         * - INSERT mappings mới
         * 
         * Example request body:
         * {
         *   "categories": [
         *     {"category_id": 21, "subtype_name": "Rạp chiếu phim", "display_order": 1},
         *     {"category_id": 22, "subtype_name": "Rạp mini", "display_order": 2}
         *   ]
         * }
         */
        
        // Sync categories thông qua service layer
        $group = $this->service->syncCategories(
            $activityGroup,
            $request->validated('categories')
        );

        // Return response với data đã sync
        return $this->response(
            new ActivityGroupResource($group),
            'Categories synced successfully'
        );
    }
}


