<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CreateCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\PaginationResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $service;

    public function __construct(CategoryService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/categories",
     *     tags={"Admin - Categories"},
     *     summary="Get all categories (Admin)",
     *     description="Get paginated list of all categories - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string")
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
    public function index(Request $request)
    {
        // Admin can view all categories
        $data = $this->service->all($request->all());
        return $this->response(new PaginationResource(CategoryResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/categories",
     *     tags={"Admin - Categories"},
     *     summary="Create a new category (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="display_name", type="string"),
     *             @OA\Property(property="description", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created"
     *     )
     * )
     */
    public function store(CreateCategoryRequest $request)
    {
        $category = $this->service->create($request->validated());
        return $this->response(new CategoryResource($category), 'Category created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/categories/{category}",
     *     tags={"Admin - Categories"},
     *     summary="Get category details (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function show(Category $category)
    {
        return $this->response(new CategoryResource($category));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/categories/{category}",
     *     tags={"Admin - Categories"},
     *     summary="Update a category (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="display_name", type="string"),
     *             @OA\Property(property="description", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $this->service->update($request->validated(), $category->id);
        return $this->response(new CategoryResource($data), 'Category updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/categories/{category}",
     *     tags={"Admin - Categories"},
     *     summary="Delete a category (Admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function destroy(Category $category)
    {
        $this->service->delete($category->id);
        return $this->response(null, 'Category deleted successfully');
    }
}
