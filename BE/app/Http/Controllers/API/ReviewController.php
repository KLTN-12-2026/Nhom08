<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\CreateReviewRequest;
use App\Http\Requests\Review\UpdateReviewRequest;
use App\Http\Resources\Review\ReviewResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Review;
use App\Services\ReviewService;
use App\Services\MediaService;

class ReviewController extends Controller
{
    protected $service;
    protected $mediaService;

    public function __construct(ReviewService $service, MediaService $mediaService)
    {
        $this->service = $service;
        $this->mediaService = $mediaService;
    }

    /**
     * @OA\Get(
     *     path="/api/reviews",
     *     tags={"Reviews"},
     *     summary="Get all reviews",
     *     description="Get all reviews",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Great food")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[place_id]=1&filters[rating]=5",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"place_id": "1", "rating": "5"}
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", example="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order: asc or desc",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, example="desc")
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
     *                 @OA\Items()
     *             )
     *         )
     *     )
     * )
     */
    public function index(SearchFilterRequest $request)
    {
        $this->authorize("index", Review::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(ReviewResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/reviews",
     *     tags={"Reviews"},
     *     summary="Create a new review",
     *     description="Create a new review",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"place_id", "rating"},
     *             @OA\Property(property="place_id", type="integer", example=1),
     *             @OA\Property(property="rating", type="number", format="float", example=4.5),
     *             @OA\Property(property="comment", type="string", example="Nhà hàng rất ngon, phục vụ tốt!"),
     *             @OA\Property(property="image_urls", type="array", @OA\Items(type="string"), example={"https://res.cloudinary.com/.../review1.jpg"}, description="Array of image URLs (already uploaded to Cloudinary by client). Max 10 images.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="...")
     *         )
     *     )
     * )
     */
    public function create(CreateReviewRequest $request)
    {
        $this->authorize("create", Review::class);
        // Automatically set user_id from authenticated user (ignore user_id from request for security)
        $data = $request->all();
        unset($data['user_id']); // Remove user_id if user tries to send it
        $data['user_id'] = $request->user()->id;
        
        // Handle image URLs if provided
        $imageUrls = $request->input('image_urls', []);
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $userId = $request->user()->id;
            $placeId = $data['place_id'] ?? null;
            
            // Save image URLs to database
            $uploadedMedia = $this->mediaService->saveImageUrlsToDatabase(
                $imageUrls,
                $userId,
                null, // post_id
                $placeId,
                null  // review_id (will be set after review creation)
            );
            
            // Get media IDs from uploaded media
            $mediaIds = array_column($uploadedMedia, 'id');
            
            // Merge with existing media_ids if any
            if (isset($data['media_ids']) && is_array($data['media_ids'])) {
                $data['media_ids'] = array_merge($data['media_ids'], $mediaIds);
            } else {
                $data['media_ids'] = $mediaIds;
            }
        }
        
        $data = $this->service->create($data);
        return $this->response(new ReviewResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/reviews/place/{placeId}",
     *     tags={"Reviews"},
     *     summary="Get reviews by place ID",
     *     description="Get all reviews for a specific place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Page number",
     *         @OA\Schema(type="integer", minimum=1, example=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Items per page (default 20, max 100)",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, example=20)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", example="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order: asc or desc",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, example="desc")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object"
     *             )
     *         )
     *     )
     * )
     */
    public function getByPlace(\Illuminate\Http\Request $request, $placeId)
    {
        $this->authorize("index", Review::class);
        
        $perPage = $request->input('per_page', 20);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $reviews = Review::where('place_id', $placeId)
            ->with(['user', 'place', 'media'])
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage);
        
        return $this->response(new PaginationResource(ReviewResource::collection($reviews)));
    }

    /**
     * @OA\Get(
     *     path="/api/reviews/{id}",
     *     tags={"Reviews"},
     *     summary="Get a review by ID",
     *     description="Get a review by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Review ID",
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
    public function show(Review $review)
    {
        $this->authorize("show", Review::class);
        $review->load(['user', 'place', 'media']);
        return $this->response(new ReviewResource($review));
    }

    /**
     * @OA\Put(
     *     path="/api/reviews/{id}",
     *     tags={"Reviews"},
     *     summary="Update a review",
     *     description="Update a review",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Review ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="rating", type="number", format="float", example=5.0),
     *             @OA\Property(property="comment", type="string", example="Nhà hàng cực kỳ ngon, phục vụ xuất sắc!"),
     *             @OA\Property(property="image_urls", type="array", @OA\Items(type="string"), example={"https://res.cloudinary.com/.../review2.jpg"}, description="Array of new image URLs to add (already uploaded to Cloudinary by client). Max 10 images.")
     *         )
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
    public function update(UpdateReviewRequest $request, Review $review)
    {
        $this->authorize("update", $review);
        $data = $request->all();
        
        // Handle new image URLs if provided
        $imageUrls = $request->input('image_urls', []);
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $userId = $request->user()->id;
            $placeId = $review->place_id;
            
            // Save image URLs to database
            $uploadedMedia = $this->mediaService->saveImageUrlsToDatabase(
                $imageUrls,
                $userId,
                null, // post_id
                $placeId,
                null  // review_id (will be set after review update)
            );
            
            // Get media IDs from uploaded media
            $mediaIds = array_column($uploadedMedia, 'id');
            
            // Merge with existing media_ids if any
            if (isset($data['media_ids']) && is_array($data['media_ids'])) {
                $data['media_ids'] = array_merge($data['media_ids'], $mediaIds);
            } else {
                $data['media_ids'] = $mediaIds;
            }
        }
        
        $data = $this->service->update($data, $review->id);
        return $this->response(new ReviewResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/reviews/{id}",
     *     tags={"Reviews"},
     *     summary="Delete a review",
     *     description="Delete a review",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Review ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example="[]")
     *         )
     *     )
     * )
     */
    public function destroy(Review $review)
    {
        $this->authorize("destroy", $review);
        $this->service->delete($review->id);
        $data = [];
        return $this->response($data);
    }
}
