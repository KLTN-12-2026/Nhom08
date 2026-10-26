<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Place\CreatePlaceRequest;
use App\Http\Requests\Place\UpdatePlaceRequest;
use App\Http\Resources\Place\PlaceResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Place;
use App\Services\PlaceService;
use App\Services\MediaService;
use Illuminate\Support\Facades\Http;

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
     *     path="/api/places",
     *     tags={"Places"},
     *     summary="Get all places with filters",
     *     description="Get paginated list of places with advanced filtering, sorting, and search capabilities. Public endpoint - no authentication required. Limit: 15 places for guests/users with no places, unlimited for users with places.",
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by. Available: average_price, rating, created_at, updated_at, name, distance (when latitude/longitude provided)",
     *         @OA\Schema(type="string", enum={"average_price", "rating", "created_at", "updated_at", "name", "distance"}, default="created_at", example="created_at")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         required=false,
     *         description="Sort order: asc (ascending) or desc (descending)",
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="desc", example="desc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Number of items per page (default: 20, max: 100)",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, default=20, example=20)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Page number (default: 1)",
     *         @OA\Schema(type="integer", minimum=1, default=1, example=1)
     *     ),
     *     @OA\Parameter(
     *         name="activity_group_ids",
     *         in="query",
     *         required=false,
     *         description="Filter by activity group IDs (comma-separated or array)",
     *         @OA\Schema(type="string", example="1,2,3")
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
     *                     property="data",
     *                     type="array",
     *                     @OA\Items(type="object")
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="per_page", type="integer", example=20),
     *                 @OA\Property(property="total", type="integer", example=100),
     *                 @OA\Property(property="last_page", type="integer", example=5)
     *             )
     *         )
     *     )
     * )
     */
    public function index(SearchFilterRequest $request)
    {
        // No authorization required - public endpoint
        // Limit is automatically applied: 15 for guests/users with no places, unlimited for users with places
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(PlaceResource::collection($data)));
    }

    /**
     * @OA\Get(
     *     path="/api/places/my-favorites",
     *     tags={"Places"},
     *     summary="Get my favorite places",
     *     description="Get all favorite places of the authenticated user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Restaurant")
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
     *                 type="object"
     *             )
     *         )
     *     )
     * )
     */
    public function myFavorites(\Illuminate\Http\Request $request)
    {
        $this->authorize("index", Place::class);
        $userId = $request->user()->id;
        $data = $this->service->getMyFavorites($userId, $request);
        return $this->response(new PaginationResource(PlaceResource::collection($data)));
    }

    /**
     * Get places created by the authenticated user that are waiting for approval
     */
    public function myPlaces(\Illuminate\Http\Request $request)
    {
        $this->authorize("index", Place::class);
        $userId = $request->user()->id;
        $data = $this->service->getMyPlaces($userId, $request);
        return $this->response(new PaginationResource(PlaceResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/places",
     *     tags={"Places"},
     *     summary="Create a new place",
     *     description="Create a new place",
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
             *             @OA\Property(property="activity_group_ids", type="array", @OA\Items(type="integer"), example={1, 2}, description="Array of activity group IDs to associate with the place."),
             *             @OA\Property(property="average_price", type="number", format="float", example=150000),
     *             @OA\Property(property="contact_email", type="string", example="contact@restaurant.com"),
     *             @OA\Property(property="contact_phone", type="string", example="0123456789"),
     *             @OA\Property(property="is_anonymous", type="boolean", example=false),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"romantic", "outdoor", "photogenic"}),
     *             @OA\Property(property="rating", type="number", format="float", example=4.5, description="Rating from 0 to 5. If provided, will automatically create a review with this rating."),
     *             @OA\Property(property="review_comment", type="string", example="Nhà hàng ngon, view đẹp", description="Optional comment for the review created when rating is provided."),
     *             @OA\Property(property="image_urls", type="array", @OA\Items(type="string"), example={"https://res.cloudinary.com/.../image1.jpg", "https://res.cloudinary.com/.../image2.jpg"}, description="Array of image URLs (already uploaded to Cloudinary by client). Max 10 images.")
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
    public function create(CreatePlaceRequest $request)
    {
        $this->authorize("create", Place::class);
        $data = $request->all();
        unset($data['user_id']);
        $data['user_id'] = $request->user()->id;

        $imageUrls = $request->input('image_urls', []);

        $place = $this->service->create($data);

        // Save image URLs to database (already uploaded to Cloudinary by client)
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
                $place->load('media');
            }
        }

        return $this->response(new PlaceResource($place), statusCode: 201);
    }

    /**
     * @OA\Post(
     *     path="/api/places/{placeId}/contribute",
     *     tags={"Places"},
     *     summary="Contribute media to a place",
     *     description="Allow any authenticated user to contribute media (images) to a place. This endpoint can be disabled if spam occurs.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"media_ids"},
     *             @OA\Property(
     *                 property="media_ids",
     *                 type="array",
     *                 @OA\Items(type="integer"),
     *                 example={1, 2, 3},
     *                 description="Array of media IDs to attach to the place"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Media contributed successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function contributeMedia(\Illuminate\Http\Request $request, $placeId)
    {
        $place = Place::findOrFail($placeId);
        $this->authorize('addMedia', $place);

        $validated = $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'required|integer|exists:media,id',
        ]);

        // Attach media to place (avoiding duplicates)
        $place->media()->syncWithoutDetaching($validated['media_ids']);

        // Reload place with media
        $place->load('media');

        return $this->response(new PlaceResource($place), message: 'Media contributed successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/places/{id}",
     *     tags={"Places"},
     *     summary="Get a place by ID",
     *     description="Get a place by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
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
     *             @OA\Property(property="data", type="object", example="...")
     *         )
     *     )
     * )
     */
    public function show(Place $place)
    {
        // $this->authorize("show", $place);
    if (request()->user()) {
        $this->authorize("show", $place);
    }
        $place->load([
            'categories', 
            'activityGroups',
            'media', 
            'user',
            'reviews' => function ($query) {
                $query->with(['user', 'media'])
                      ->orderBy('created_at', 'desc')
                      ->limit(3);
            }
        ]);
        return $this->response(new PlaceResource($place));
    }

    /**
     * @OA\Put(
     *     path="/api/places/{id}",
     *     tags={"Places"},
     *     summary="Update a place",
     *     description="Update a place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Nhà hàng ABC Updated"),
     *             @OA\Property(property="address", type="string", example="456 Đường XYZ, Quận 2, TP.HCM"),
     *             @OA\Property(property="latitude", type="number", format="float", example=10.762622),
     *             @OA\Property(property="longitude", type="number", format="float", example=106.660172),
             *             @OA\Property(property="description", type="string", example="Nhà hàng ngon đã cập nhật"),
             *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer"), example={2, 3}),
             *             @OA\Property(property="activity_group_ids", type="array", @OA\Items(type="integer"), example={1, 2}, description="Array of activity group IDs to associate with the place."),
             *             @OA\Property(property="average_price", type="number", format="float", example=200000),
     *             @OA\Property(property="contact_email", type="string", example="newcontact@restaurant.com"),
             *             @OA\Property(property="contact_phone", type="string", example="0987654321"),
             *             @OA\Property(property="is_anonymous", type="boolean", example=true),
             *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"romantic", "outdoor"}),
             *             @OA\Property(property="image_urls", type="array", @OA\Items(type="string"), example={"https://res.cloudinary.com/.../img1.jpg", "https://res.cloudinary.com/.../img3.jpg", "https://res.cloudinary.com/.../new1.jpg"}, description="ALL image URLs to keep (both existing and new). Backend will sync automatically. Max 10 images.")
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
    public function update(UpdatePlaceRequest $request, Place $place)
    {
        $this->authorize("update", $place);
        $data = $this->service->update($request->all(), $place->id);

        // Unified media management: Send ALL URLs (existing + new)
        // Backend will sync automatically:
        // - Keep media with matching URLs
        // - Add new URLs
        // - Remove URLs not in the list
        
        $imageUrls = $request->input('image_urls');

        if ($imageUrls !== null && is_array($imageUrls)) {
            // Get current media
            $currentMedia = $place->media;
            $currentUrls = $currentMedia->pluck('url')->toArray();
            
            // Find URLs to keep (existing URLs that are in the request)
            $urlsToKeep = array_intersect($imageUrls, $currentUrls);
            
            // Find new URLs (in request but not in current)
            $newUrls = array_diff($imageUrls, $currentUrls);
            
            // Get media IDs to keep
            $mediaIdsToKeep = $currentMedia
                ->filter(fn($m) => in_array($m->url, $urlsToKeep))
                ->pluck('id')
                ->toArray();
            
            // Step 1: Delete media not in the keep list
            // Note: Cannot use sync() because media() is HasMany, not BelongsToMany
            $place->media()->whereNotIn('id', $mediaIdsToKeep)->delete();
            
            // Step 2: Add new media from new URLs
            if (!empty($newUrls)) {
                $this->mediaService->saveImageUrlsToDatabase(
                    array_values($newUrls),
                    $request->user()->id,
                    null,
                    $place->id,
                    null
                );
            }
            
            // Reload media
            $data->load('media');
        }

        return $this->response(new PlaceResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/places/{id}",
     *     tags={"Places"},
     *     summary="Delete a place",
     *     description="Delete a place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
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
     *             @OA\Property(property="data", type="object", example="[]")
     *         )
     *     )
     * )
     */
    public function destroy(Place $place)
    {
        $this->authorize("destroy", $place);
        $this->service->delete($place->id);
        $data = [];
        return $this->response($data);
    }

    /**
     * @OA\Get(
     *     path="/api/places/movie",
     *     tags={"Places"},
     *     summary="Fetch movies from Moveek",
     *     description="Fetch and parse movie data from Moveek website",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Movies fetched successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=17258),
     *                 @OA\Property(property="title", type="string", example="Phá Đám Sinh Nhật Mẹ"),
     *                 @OA\Property(property="slug", type="string", example="pha-dam-sinh-nhat-me"),
     *                 @OA\Property(property="poster", type="string", example="https://cdn.moveek.com/storage/media/cache/short/68ecd02361129538851095.png"),
     *                 @OA\Property(property="release_date", type="string", example="31/10"),
     *                 @OA\Property(property="rating", type="string", nullable=true, example="89%"),
     *                 @OA\Property(property="genres", type="array", @OA\Items(type="string"), example={"drama", "family"}),
     *                 @OA\Property(property="language", type="string", example="vietnamese")
     *             ))
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error fetching data",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to fetch data"),
     *             @OA\Property(property="data", type="null")
     *         )
     *     )
     * )
     */
    public function movie()
    {
        try {
            $response = Http::withHeaders([
                'accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language' => 'en-US,en;q=0.9',
                'cookie' => 'PHPSESSID=cc85d45c5dc4f25916e53c7721471ccb; region=1; cinema=126820; mvk_tutorial_showtime_price=1',
                'dnt' => '1',
                'priority' => 'u=0, i',
                'referer' => 'https://www.google.com/',
                'sec-ch-ua' => '"Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"',
                'sec-ch-ua-mobile' => '?0',
                'sec-ch-ua-platform' => '"macOS"',
                'sec-fetch-dest' => 'document',
                'sec-fetch-mode' => 'navigate',
                'sec-fetch-site' => 'cross-site',
                'sec-fetch-user' => '?1',
                'upgrade-insecure-requests' => '1',
                'user-agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
            ])->timeout(30)->get('https://moveek.com/dang-chieu/');

            if (!$response->successful()) {
                return $this->errorResponse('Failed to fetch data', null, $response->status());
            }

            $html = $response->body();
            $movies = $this->parseMovies($html);

            return $this->response($movies, 'Movies fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Error: ' . $e->getMessage(), null, 500);
        }
    }

    protected function parseMovies($html)
    {
        $movies = [];
        
        // Load HTML into DOMDocument
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        
        // Find all movie items
        $items = $xpath->query('//div[contains(@class, "item") and contains(@class, "col-lg-2")]');
        
        foreach ($items as $item) {
            /** @var \DOMElement $item */
            $movie = [];
            
            // Get movie ID from like button
            $likeButton = $xpath->query('.//a[contains(@class, "btn-do-movie-like")]', $item)->item(0);
            if ($likeButton instanceof \DOMElement) {
                $movie['id'] = (int) $likeButton->getAttribute('data-id');
            }
            
            // Get title and slug from link
            $titleLink = $xpath->query('.//h3/a', $item)->item(0);
            if ($titleLink instanceof \DOMElement) {
                $movie['title'] = trim($titleLink->getAttribute('title') ?: $titleLink->textContent);
                $href = $titleLink->getAttribute('href');
                // Extract slug from /lich-chieu/slug/
                if (preg_match('/\/lich-chieu\/([^\/]+)\//', $href, $matches)) {
                    $movie['slug'] = $matches[1];
                }
            }
            
            // Get poster image
            $img = $xpath->query('.//img[@data-src]', $item)->item(0);
            if ($img instanceof \DOMElement) {
                $movie['poster'] = $img->getAttribute('data-src') ?: $img->getAttribute('src');
            }
            
            // Get release date
            $dateNode = $xpath->query('.//div[contains(@class, "text-muted")]', $item)->item(0);
            if ($dateNode instanceof \DOMElement) {
                $movie['release_date'] = trim($dateNode->textContent);
            }
            
            // Get rating
            $ratingLink = $xpath->query('.//a[contains(@href, "/review/")]', $item)->item(0);
            if ($ratingLink instanceof \DOMElement) {
                $ratingText = trim($ratingLink->textContent);
                if (preg_match('/(\d+)%/', $ratingText, $matches)) {
                    $movie['rating'] = $matches[1] . '%';
                }
            }
            
            // Get genres from class
            $classes = $item->getAttribute('class');
            $genres = [];
            if (preg_match_all('/genre-([a-z-]+)/', $classes, $matches)) {
                $genres = $matches[1];
            }
            $movie['genres'] = $genres;
            
            // Get language from class
            if (preg_match('/language-([a-z]+)/', $classes, $matches)) {
                $movie['language'] = $matches[1];
            }
            
            if (!empty($movie['id']) && !empty($movie['title'])) {
                $movies[] = $movie;
            }
        }
        
        return $movies;
    }
}
