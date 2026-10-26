<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\CreateTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
use App\Http\Resources\Tag\TagResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\Request;

class TagController extends Controller
{
    protected $service;
    
    public function __construct(TagService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/tags",
     *     tags={"Admin - Tags"},
     *     summary="Get all tags (Admin)",
     *     description="Get all tags with pagination and filtering - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="romantic")
     *     ),
     *     @OA\Parameter(
     *         name="filters[display]",
     *         in="query",
     *         required=false,
     *         description="Filter by display status",
     *         @OA\Schema(type="integer", enum={0, 1}, example=1)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", enum={"name", "created_at", "updated_at"}, default="name")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="asc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Items per page",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, default=10)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Page number",
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(SearchFilterRequest $request)
    {
        $this->authorize("viewAny", Tag::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(TagResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/tags",
     *     tags={"Admin - Tags"},
     *     summary="Create a new tag (Admin)",
     *     description="Create a new tag - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="romantic"),
     *             @OA\Property(property="display", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tag created successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(CreateTagRequest $request)
    {
        $this->authorize("create", Tag::class);
        $data = $request->all();
        if (!isset($data['display'])) {
            $data['display'] = true;
        }
        $tag = $this->service->create($data);
        return $this->response(new TagResource($tag), 'Tag created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/tags/{tag}",
     *     tags={"Admin - Tags"},
     *     summary="Get tag details (Admin)",
     *     description="Get detailed information about a specific tag - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tag",
     *         in="path",
     *         required=true,
     *         description="Tag ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show(Tag $tag)
    {
        $this->authorize("view", $tag);
        return $this->response(new TagResource($tag));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/tags/{tag}",
     *     tags={"Admin - Tags"},
     *     summary="Update a tag (Admin)",
     *     description="Update tag information - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tag",
     *         in="path",
     *         required=true,
     *         description="Tag ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="romantic updated"),
     *             @OA\Property(property="display", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tag updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(UpdateTagRequest $request, Tag $tag)
    {
        $this->authorize("update", $tag);
        $data = $this->service->update($request->all(), $tag->id);
        return $this->response(new TagResource($data), 'Tag updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/tags/{tag}",
     *     tags={"Admin - Tags"},
     *     summary="Delete a tag (Admin)",
     *     description="Delete a tag - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tag",
     *         in="path",
     *         required=true,
     *         description="Tag ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tag deleted successfully"),
     *             @OA\Property(property="data", type="object", example=null)
     *         )
     *     )
     * )
     */
    public function destroy(Tag $tag)
    {
        $this->authorize("delete", $tag);
        $this->service->delete($tag->id);
        return $this->response(null, 'Tag deleted successfully');
    }
}
