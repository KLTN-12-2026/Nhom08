<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Place\CreatePlaceRequest;
use App\Http\Requests\Place\UpdatePlaceRequest;
use App\Http\Resources\Place\PlaceResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Place;
use App\Services\PlaceService;
use App\Services\MediaService;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    protected $service;
    protected $mediaService;

    public function __construct(PlaceService $service, MediaService $mediaService)
    {
        $this->service = $service;
        $this->mediaService = $mediaService;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/places",
     *     tags={"Admin - Places"},
     *     summary="Get all places (Admin)",
     *     description="Get paginated list of all places with advanced filtering - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Restaurant")
     *     ),
     *     @OA\Parameter(
     *         name="price_min",
     *         in="query",
     *         required=false,
     *         description="Minimum average price filter",
     *         @OA\Schema(type="number", format="float", example=100000)
     *     ),
     *     @OA\Parameter(
     *         name="price_max",
     *         in="query",
     *         required=false,
     *         description="Maximum average price filter",
     *         @OA\Schema(type="number", format="float", example=500000)
     *     ),
     *     @OA\Parameter(
     *         name="category_ids",
     *         in="query",
     *         required=false,
     *         description="Filter by category IDs",
     *         @OA\Schema(type="array", @OA\Items(type="integer")),
     *         style="form",
     *         explode=true
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", enum={"average_price", "rating", "created_at", "updated_at", "name"}, default="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="desc")
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
        $this->authorize('viewAny', Place::class);
        
        // Enable admin view to see all places regardless of status
        $requestData = $request->all();
        $requestData['admin_view'] = true;
        
        $modifiedRequest = new \Illuminate\Http\Request($requestData);
        $modifiedRequest->setUserResolver($request->getUserResolver());
        
        $data = $this->service->all($modifiedRequest);
        return $this->response(new PaginationResource(PlaceResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/places",
     *     tags={"Admin - Places"},
     *     summary="Create a new place (Admin)",
     *     description="Create a new place - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "address"},
     *             @OA\Property(property="name", type="string", example="Nhà hàng ABC"),
     *             @OA\Property(property="address", type="string", example="123 Đường ABC, Quận 1, TP.HCM"),
     *             @OA\Property(property="latitude", type="number", format="float", example=10.762622),
     *             @OA\Property(property="longitude", type="number", format="float", example=106.660172),
     *             @OA\Property(property="description", type="string", example="Nhà hàng ngon"),
     *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="average_price", type="number", format="float", example=150000),
     *             @OA\Property(property="contact_email", type="string", example="contact@restaurant.com"),
     *             @OA\Property(property="contact_phone", type="string", example="0123456789"),
     *             @OA\Property(property="is_anonymous", type="boolean", example=false),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"romantic", "outdoor"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place created successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(CreatePlaceRequest $request)
    {
        $this->authorize('create', Place::class);
        $data = $request->all();
        
        // Admin can set user_id, otherwise use authenticated user
        if (!isset($data['user_id'])) {
            $data['user_id'] = $request->user()->id;
        }

        // Wrap creation in DB transaction for better performance
        $place = \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            return $this->service->create($data);
        });

        // Handle image URLs (client-side upload to Cloudinary)
        $imageUrls = $request->input('image_urls', []);
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $this->mediaService->saveImageUrlsToDatabase(
                $imageUrls,
                $request->user()->id,
                null, // post_id
                $place->id,
                null  // review_id
            );
            
            $place->load('media');
        }

        return $this->response(new PlaceResource($place), 'Place created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/places/{place}",
     *     tags={"Admin - Places"},
     *     summary="Get place details (Admin)",
     *     description="Get detailed information about a specific place - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
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
    public function show(Place $place)
    {
        $this->authorize('view', $place);
        $place->load([
            'categories', 
            'media', 
            'user',
            'reviews' => function ($query) {
                $query->with(['user', 'media'])
                      ->orderBy('created_at', 'desc');
            }
        ]);
        return $this->response(new PlaceResource($place));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/places/{place}",
     *     tags={"Admin - Places"},
     *     summary="Update a place (Admin)",
     *     description="Update place information - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Nhà hàng ABC Updated"),
     *             @OA\Property(property="address", type="string", example="456 Đường XYZ"),
     *             @OA\Property(property="latitude", type="number", format="float", example=10.762622),
     *             @OA\Property(property="longitude", type="number", format="float", example=106.660172),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer"), example={2, 3}),
     *             @OA\Property(property="average_price", type="number", format="float", example=200000),
     *             @OA\Property(property="contact_email", type="string", example="newcontact@restaurant.com"),
     *             @OA\Property(property="contact_phone", type="string", example="0987654321"),
     *             @OA\Property(property="is_anonymous", type="boolean", example=true),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"romantic", "outdoor"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(UpdatePlaceRequest $request, Place $place)
    {
        $this->authorize('update', $place);
        $data = $this->service->update($request->all(), $place->id);
        
        // Handle image URLs (client-side upload to Cloudinary)
        $imageUrls = $request->input('image_urls', []);
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $this->mediaService->saveImageUrlsToDatabase(
                $imageUrls,
                $request->user()->id,
                null, // post_id
                $place->id,
                null  // review_id
            );
        }

        // Upload and save raw image files from client
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            if (is_array($images)) {
                $this->mediaService->uploadMultipleAndSave(
                    $images,
                    'places',
                    $request->user()->id,
                    null,
                    $place->id
                );
            }
        }
        
        $place->load('media');

        return $this->response(new PlaceResource($data), 'Place updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/places/{place}",
     *     tags={"Admin - Places"},
     *     summary="Delete a place (Admin)",
     *     description="Delete a place - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place deleted successfully"),
     *             @OA\Property(property="data", type="object", example=null)
     *         )
     *     )
     * )
     */
    public function destroy(Place $place)
    {
        $this->authorize('delete', $place);
        $this->service->delete($place->id);
        return $this->response(null, 'Place deleted successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/admin/places/{place}/approve",
     *     tags={"Admin - Places"},
     *     summary="Approve a place",
     *     description="Approve a place that is waiting for approval",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="admin_notes", type="string", example="Approved - looks good")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place approved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function approve(Request $request, Place $place)
    {
        $this->authorize('update', $place);
        
        $adminNotes = $request->input('admin_notes');
        $updatedPlace = $this->service->updateStatus(
            $place->id,
            \App\Enums\PlaceStatusEnum::APPROVED->value,
            $adminNotes
        );
        
        return $this->response(new PlaceResource($updatedPlace), 'Place approved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/admin/places/{place}/reject",
     *     tags={"Admin - Places"},
     *     summary="Reject a place",
     *     description="Reject a place that is waiting for approval",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="admin_notes", type="string", example="Rejected - spam content")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place rejected successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function reject(Request $request, Place $place)
    {
        $this->authorize('update', $place);
        
        $adminNotes = $request->input('admin_notes');
        $updatedPlace = $this->service->updateStatus(
            $place->id,
            \App\Enums\PlaceStatusEnum::REJECTED->value,
            $adminNotes
        );
        
        return $this->response(new PlaceResource($updatedPlace), 'Place rejected successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/admin/places/{place}/status",
     *     tags={"Admin - Places"},
     *     summary="Update place status",
     *     description="Update place status (0=waiting, 1=approved, 2=rejected)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="place",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="integer", enum={0, 1, 2}, example=1, description="0=waiting, 1=approved, 2=rejected"),
     *             @OA\Property(property="admin_notes", type="string", example="Status updated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place status updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function updateStatus(Request $request, Place $place)
    {
        $this->authorize('update', $place);
        
        $request->validate([
            'status' => 'required|integer|in:0,1,2',
            'admin_notes' => 'nullable|string|max:1000',
        ]);
        
        $updatedPlace = $this->service->updateStatus(
            $place->id,
            $request->input('status'),
            $request->input('admin_notes')
        );
        
        return $this->response(new PlaceResource($updatedPlace), 'Place status updated successfully');
    }
}
