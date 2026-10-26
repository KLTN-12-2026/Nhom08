<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\Tag\TagResource;
use App\Models\Category;
use App\Models\Tag;

class FilterController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/filters",
     *     tags={"Filters"},
     *     summary="Get all filters (categories and tags)",
     *     description="Get all categories and tags in a single request for filter options",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="categories_only",
     *         in="query",
     *         required=false,
     *         description="Return only categories if set to true",
     *         @OA\Schema(type="boolean", example=false)
     *     ),
     *     @OA\Parameter(
     *         name="tags_only",
     *         in="query",
     *         required=false,
     *         description="Return only tags if set to true",
     *         @OA\Schema(type="boolean", example=false)
     *     ),
     *     @OA\Parameter(
     *         name="category_is_active",
     *         in="query",
     *         required=false,
     *         description="Filter categories by is_active status (default: true)",
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="tag_display",
     *         in="query",
     *         required=false,
     *         description="Filter tags by display status (default: true)",
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="categories",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="food"),
     *                         @OA\Property(property="display_name", type="string", example="Đồ ăn"),
     *                         @OA\Property(property="description", type="string", example="Các địa điểm ăn uống"),
     *                         @OA\Property(property="is_active", type="boolean", example=true)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="tags",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="romantic"),
     *                         @OA\Property(property="display", type="boolean", example=true)
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $categoriesOnly = $request->boolean('categories_only', false);
        $tagsOnly = $request->boolean('tags_only', false);
        $categoryIsActive = $request->boolean('category_is_active', true);
        $tagDisplay = $request->boolean('tag_display', true);

        $data = [];

        // Get categories
        if (!$tagsOnly) {
            $categoriesQuery = Category::query();
            
            if ($categoryIsActive !== null) {
                $categoriesQuery->where('is_active', $categoryIsActive);
            }
            
            $categories = $categoriesQuery->orderBy('name', 'asc')->get();
            $data['categories'] = CategoryResource::collection($categories);
        }

        // Get tags
        if (!$categoriesOnly) {
            $tagsQuery = Tag::query();
            
            if ($tagDisplay !== null) {
                $tagsQuery->where('display', $tagDisplay);
            }
            
            $tags = $tagsQuery->orderBy('name', 'asc')->get();
            $data['tags'] = TagResource::collection($tags);
        }

        return $this->response($data);
    }
}

