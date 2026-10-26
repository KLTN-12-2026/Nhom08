<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\CreateMediaRequest;
use App\Http\Requests\Media\UpdateMediaRequest;
use App\Http\Resources\Media\MediaResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    protected $service;
    protected $mediaService;

    public function __construct(MediaService $service)
    {
        $this->service = $service;
        $this->mediaService = $service; // Sử dụng cùng instance
    }

    /**
     * @OA\Get(
     *     path="/api/media",
     *     tags={"Media"},
     *     summary="Get all media files",
     *     description="Get all media files",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="profile.jpg")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[format]=jpg",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "format": "jpg"}
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
        $this->authorize("index", Media::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(MediaResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/media/upload",
     *     tags={"Media"},
     *     summary="Upload a new media file",
     *     description="Upload a new media file and associate it with a user, post, place, or review",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"image"},
     *                 @OA\Property(property="image", type="string", format="binary", description="Image file"),
     *                 @OA\Property(property="folder", type="string", example="general"),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="post_id", type="integer", example=1),
     *                 @OA\Property(property="place_id", type="integer", example=1),
     *                 @OA\Property(property="review_id", type="integer", example=1)
     *             )
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
    public function uploadSingle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            'folder' => 'nullable|string|max:100',
            'user_id' => 'nullable|integer|exists:users,id',
            'post_id' => 'nullable|integer|exists:posts,id',
            'place_id' => 'nullable|integer|exists:places,id',
            'review_id' => 'nullable|integer|exists:reviews,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $folder = $request->input('folder', 'general');
            $mediaFile = $this->mediaService->uploadAndSaveImage(
                $request->file('image'),
                $folder,
                $request->input('user_id'),
                $request->input('post_id'),
                $request->input('place_id'),
                $request->input('review_id')
            );

            return response()->json([
                'success' => true,
                'data' => new MediaResource($mediaFile),
                'message' => 'Image uploaded successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Image upload failed', [
                'message' => $e->getMessage(),
                'exception' => get_class($e),
                'file_name' => optional($request->file('image'))->getClientOriginalName(),
                'folder' => $request->input('folder'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image',
                'data' => [
                    'error' => $e->getMessage(),
                    'exception' => class_basename($e),
                ]
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/media/upload-multiple",
     *     tags={"Media"},
     *     summary="Upload multiple media files",
     *     description="Upload multiple media files and associate them with a user, post, place, or review",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"images"},
     *                 @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary"), description="Image files"),
     *                 @OA\Property(property="folder", type="string", example="general"),
     *                 @OA\Property(property="user_id", type="integer", example=1),
     *                 @OA\Property(property="post_id", type="integer", example=1),
     *                 @OA\Property(property="place_id", type="integer", example=1),
     *                 @OA\Property(property="review_id", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'folder' => 'nullable|string|max:100',
            'user_id' => 'nullable|integer|exists:users,id',
            'post_id' => 'nullable|integer|exists:posts,id',
            'place_id' => 'nullable|integer|exists:places,id',
            'review_id' => 'nullable|integer|exists:reviews,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $folder = $request->input('folder', 'general');
            $mediaFiles = $this->mediaService->uploadMultipleAndSave(
                $request->file('images'),
                $folder,
                $request->input('user_id'),
                $request->input('post_id'),
                $request->input('place_id'),
                $request->input('review_id')
            );

            return response()->json([
                'success' => true,
                'data' => MediaResource::collection($mediaFiles),
                'message' => 'Images uploaded successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Multiple image upload failed', [
                'message' => $e->getMessage(),
                'exception' => get_class($e),
                'file_names' => collect($request->file('images', []))
                    ->map(fn ($file) => $file->getClientOriginalName())
                    ->all(),
                'folder' => $request->input('folder'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images',
                'data' => [
                    'error' => $e->getMessage(),
                    'exception' => class_basename($e),
                ]
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/media",
     *     tags={"Media"},
     *     summary="Create a new media file",
     *     description="Create a new media file entry (for URL-based media)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"url", "file_name"},
     *             @OA\Property(property="url", type="string", example="https://example.com/image.jpg"),
     *             @OA\Property(property="size", type="integer", example=102400),
     *             @OA\Property(property="file_name", type="string", example="my_image.jpg"),
     *             @OA\Property(property="width", type="integer", example=800),
     *             @OA\Property(property="height", type="integer", example=600),
     *             @OA\Property(property="format", type="string", example="jpg"),
     *             @OA\Property(property="user_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="post_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="place_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="review_id", type="integer", nullable=true, example=1)
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
    public function create(CreateMediaRequest $request)
    {
        $this->authorize("create", Media::class);
        $data = $this->service->create($request->all());
        return $this->response(new MediaResource($data), "Success", 201);
    }

    /**
     * @OA\Get(
     *     path="/api/media/{id}",
     *     tags={"Media"},
     *     summary="Get a media file by ID",
     *     description="Get a specific media file entry by its ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Media File ID",
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
    public function show(Media $media)
    {
        $this->authorize("show", $media);
        $data = $this->service->find($media->id);
        return $this->response(new MediaResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/media/{id}",
     *     tags={"Media"},
     *     summary="Update a media file",
     *     description="Update a specific media file entry by its ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Media File ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="url", type="string", example="https://example.com/updated_image.png"),
     *             @OA\Property(property="size", type="integer", example=150000),
     *             @OA\Property(property="file_name", type="string", example="updated_image.png"),
     *             @OA\Property(property="format", type="string", example="png")
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
    public function update(UpdateMediaRequest $request, Media $media)
    {
        $this->authorize("update", $media);
        $data = $this->service->update($request->all(), $media->id);
        return $this->response(new MediaResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/media/{id}",
     *     tags={"Media"},
     *     summary="Delete a media file",
     *     description="Delete a specific media file entry by its ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Media File ID",
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
    public function destroy(Media $media)
    {
        $this->authorize("destroy", $media);
        
        try {
            // Delete from Cloudinary if it's a Cloudinary URL
            if (str_contains($media->url, 'cloudinary.com')) {
                $this->mediaService->deleteImage($media->url);
            }
            
            // Delete from database
            $this->service->delete($media->id);
            
            return $this->response([], 'Media deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete media: ' . $e->getMessage());
        }
    }

    /**
     * @OA\Post(
     *     path="/api/media/{id}/transform",
     *     tags={"Media"},
     *     summary="Generate transformed image URL",
     *     description="Generate a transformed image URL with specified dimensions and quality",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Media File ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="width", type="integer", example=300),
     *             @OA\Property(property="height", type="integer", example=300),
     *             @OA\Property(property="quality", type="integer", example=80),
     *             @OA\Property(property="format", type="string", example="webp")
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
    public function transform(Request $request, Media $media): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'width' => 'nullable|integer|min:1|max:2000',
            'height' => 'nullable|integer|min:1|max:2000',
            'quality' => 'nullable|integer|min:1|max:100',
            'format' => 'nullable|string|in:jpg,png,webp,gif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'data' => $validator->errors()
            ], 422);
        }

        try {
            $transformations = [];
            if ($request->has('width')) {
                $transformations['width'] = $request->input('width');
            }
            if ($request->has('height')) {
                $transformations['height'] = $request->input('height');
            }
            if ($request->has('quality')) {
                $transformations['quality'] = $request->input('quality');
            }
            if ($request->has('format')) {
                $transformations['format'] = $request->input('format');
            }

            $transformedUrl = $this->mediaService->generateTransformationUrl(
                $media->url,
                $transformations
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'original_url' => $media->url,
                    'transformed_url' => $transformedUrl,
                    'transformations' => $transformations
                ],
                'message' => 'Transformed URL generated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}