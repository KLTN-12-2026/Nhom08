<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CreateCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Category;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    protected $service;
    
    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    /**
     * Summary of index
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Get(
     *     path="/api/categories",
     *     tags={"Categories"},
     *     summary="Get all categories",
     *     description="Get all categories",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="food")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[is_active]=1",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"is_active": "1"}
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", example="name")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order: asc or desc",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, example="asc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Items per page (default 10, max 100)",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, example=10)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Page number",
     *         @OA\Schema(type="integer", minimum=1, example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(),
     *             )
     *         )
     *     )
     * )
     */
    public function index(SearchFilterRequest $request)
    {
        // $this->authorize("index", Category::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(CategoryResource::collection($data)));
    }

    /**
     * Summary of create
     * @param \App\Http\Requests\Category\CreateCategoryRequest $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/categories",
     *     tags={"Categories"},
     *     summary="Create a new category",
     *     description="Create a new category",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "display_name"},
     *             @OA\Property(property="name", type="string", example="food"),
     *             @OA\Property(property="display_name", type="string", example="Đồ ăn"),
     *             @OA\Property(property="description", type="string", example="Các địa điểm ăn uống"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *             )
     *         ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="...")
     *             )
     *             )
     *         )
     * )
     */
    public function create(CreateCategoryRequest $request)
    {
        $this->authorize("create", Category::class);
        $data = $this->service->create($request->all());
        return $this->response(new CategoryResource($data), statusCode: 201);
    }

    /**
     * Summary of show
     * @param \App\Models\Category $category
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Get(
     *     path="/api/categories/{id}",
     *     tags={"Categories"},
     *     summary="Get a category by ID",
     *     description="Get a category by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="...")
     *         )
     *     )
     * )
     */
    public function show(Category $category)
    {
        $this->authorize("show", Category::class);
        $data = $this->service->find($category->id);
        return $this->response(new CategoryResource($data));
    }

    /**
     * Summary of update
     * @param \App\Http\Requests\Category\UpdateCategoryRequest $request
     * @param \App\Models\Category $category
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Put(
     *     path="/api/categories/{id}",
     *     tags={"Categories"},
     *     summary="Update a category",
     *     description="Update a category",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="food"),
     *             @OA\Property(property="display_name", type="string", example="Đồ ăn"),
     *             @OA\Property(property="description", type="string", example="Các địa điểm ăn uống"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *             )
     *         ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="...")
     *         )
     *)
     *)
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $this->authorize("update", $category);
        $data = $this->service->update($request->all(), $category->id);
        return $this->response(new CategoryResource($data));
    }

    /**
     * Summary of destroy
     * @param \App\Models\Category $category
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Delete(
     *     path="/api/categories/{id}",
     *     tags={"Categories"},
     *     summary="Delete a category",
     *     description="Delete a category",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Category ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="...")
     *         )
     *     )
     * )
     */
    public function destroy(Category $category)
    {
        $this->authorize("destroy", $category);
        $this->service->delete($category->id);
        $data = [];
        return $this->response($data);
    }
}