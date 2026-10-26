<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
     *     path="/api/activity-groups",
     *     tags={"Activity Groups"},
     *     summary="List active activity groups",
     *     description="Public endpoint that returns all active activity groups and their categories.",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         description="Search by name or key",
     *         @OA\Schema(type="string", example="food")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $params = $request->only(['search', 'per_page']);
        $params['is_active'] = true;
        $params['sort_by'] = 'display_order';
        $params['sort_order'] = 'asc';

        $groups = $this->service->list($params);

        return $this->response(new PaginationResource(ActivityGroupResource::collection($groups)));
    }

    /**
     * @OA\Get(
     *     path="/api/activity-groups/{id}",
     *     tags={"Activity Groups"},
     *     summary="Get activity group detail",
     *     description="Retrieve a single active activity group with its categories.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Activity group ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(ActivityGroup $activityGroup)
    {
        if (!$activityGroup->is_active) {
            abort(404);
        }

        $activityGroup->load('categories');

        return $this->response(new ActivityGroupResource($activityGroup));
    }
}


