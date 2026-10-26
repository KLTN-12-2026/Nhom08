<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Movie\MovieResource;
use App\Http\Resources\PaginationResource;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MovieController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/movies",
     *     tags={"Admin - Movies"},
     *     summary="Get all movies (Admin)",
     *     description="Get all movies with pagination and filtering - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Avengers")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         required=false,
     *         description="Filter by active status",
     *         @OA\Schema(type="integer", enum={0, 1}, example=1)
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
    public function index(Request $request)
    {
        $this->authorize('viewAny', Movie::class);
        
        $query = Movie::query();
        
        // Search
        if ($request->has('query') && !empty($request->input('query'))) {
            $searchTerm = $request->input('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->input('is_active'));
        }
        
        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = $request->input('per_page', 10);
        $data = $query->paginate($perPage);
        
        return $this->response(new PaginationResource(MovieResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/movies",
     *     tags={"Admin - Movies"},
     *     summary="Create a new movie (Admin)",
     *     description="Create a new movie - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"moveek_id", "title", "slug"},
     *             @OA\Property(property="moveek_id", type="integer", example=17258),
     *             @OA\Property(property="title", type="string", example="Avengers: Endgame"),
     *             @OA\Property(property="slug", type="string", example="avengers-endgame"),
     *             @OA\Property(property="poster", type="string", example="https://example.com/poster.jpg"),
     *             @OA\Property(property="release_date", type="string", example="26/04"),
     *             @OA\Property(property="rating", type="string", example="95%"),
     *             @OA\Property(property="genres", type="array", @OA\Items(type="string"), example={"action", "adventure"}),
     *             @OA\Property(property="language", type="string", example="english"),
     *             @OA\Property(property="description", type="string", example="Epic conclusion to the Infinity Saga"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Movie created successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('create', Movie::class);
        
        $request->validate([
            'moveek_id' => 'required|integer|unique:movies,moveek_id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:movies,slug',
            'poster' => 'nullable|string',
            'release_date' => 'nullable|string|max:50',
            'rating' => 'nullable|string|max:20',
            'genres' => 'nullable|array',
            'language' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        
        $movie = Movie::create($request->all());
        
        return $this->response(new MovieResource($movie), 'Movie created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/movies/{movie}",
     *     tags={"Admin - Movies"},
     *     summary="Get movie details (Admin)",
     *     description="Get detailed information about a specific movie - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="movie",
     *         in="path",
     *         required=true,
     *         description="Movie ID",
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
    public function show(Movie $movie)
    {
        $this->authorize('view', $movie);
        return $this->response(new MovieResource($movie));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/movies/{movie}",
     *     tags={"Admin - Movies"},
     *     summary="Update a movie (Admin)",
     *     description="Update movie information - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="movie",
     *         in="path",
     *         required=true,
     *         description="Movie ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Avengers: Endgame Updated"),
     *             @OA\Property(property="poster", type="string", example="https://example.com/new-poster.jpg"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="is_active", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Movie updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, Movie $movie)
    {
        $this->authorize('update', $movie);
        
        $request->validate([
            'moveek_id' => 'sometimes|integer|unique:movies,moveek_id,' . $movie->id,
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:movies,slug,' . $movie->id,
            'poster' => 'nullable|string',
            'release_date' => 'nullable|string|max:50',
            'rating' => 'nullable|string|max:20',
            'genres' => 'nullable|array',
            'language' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        
        $movie->update($request->all());
        
        return $this->response(new MovieResource($movie), 'Movie updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/movies/{movie}",
     *     tags={"Admin - Movies"},
     *     summary="Delete a movie (Admin)",
     *     description="Delete a movie - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="movie",
     *         in="path",
     *         required=true,
     *         description="Movie ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Movie deleted successfully"),
     *             @OA\Property(property="data", type="object", example=null)
     *         )
     *     )
     * )
     */
    public function destroy(Movie $movie)
    {
        $this->authorize('delete', $movie);
        $movie->delete();
        return $this->response(null, 'Movie deleted successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/admin/movies/sync-from-moveek",
     *     tags={"Admin - Movies"},
     *     summary="Sync movies from Moveek (Admin)",
     *     description="Fetch and sync movies from Moveek website - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Movies synced successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total", type="integer", example=20),
     *                 @OA\Property(property="created", type="integer", example=5),
     *                 @OA\Property(property="updated", type="integer", example=15)
     *             )
     *         )
     *     )
     * )
     */
    public function syncFromMoveek()
    {
        $this->authorize('create', Movie::class);
        
        try {
            $response = Http::withHeaders([
                'accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'user-agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            ])->timeout(30)->get('https://moveek.com/dang-chieu/');

            if (!$response->successful()) {
                return $this->response(null, 'Failed to fetch data from Moveek', 500);
            }

            $html = $response->body();
            $movies = $this->parseMovies($html);
            
            $created = 0;
            $updated = 0;
            
            foreach ($movies as $movieData) {
                $movie = Movie::updateOrCreate(
                    ['moveek_id' => $movieData['id']],
                    [
                        'title' => $movieData['title'],
                        'slug' => $movieData['slug'],
                        'poster' => $movieData['poster'] ?? null,
                        'release_date' => $movieData['release_date'] ?? null,
                        'rating' => $movieData['rating'] ?? null,
                        'genres' => $movieData['genres'] ?? [],
                        'language' => $movieData['language'] ?? null,
                    ]
                );
                
                if ($movie->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }
            
            return $this->response([
                'total' => count($movies),
                'created' => $created,
                'updated' => $updated,
            ], 'Movies synced successfully');
            
        } catch (\Exception $e) {
            return $this->response(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/admin/movies/detail-from-moveek/{slug}",
     *     tags={"Admin - Movies"},
     *     summary="Get movie detail from Moveek (Admin)",
     *     description="Fetch detailed movie information from Moveek website by slug - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="slug",
     *         in="path",
     *         required=true,
     *         description="Movie slug (e.g., 'avatar-3')",
     *         @OA\Schema(type="string", example="avatar-3")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="title", type="string", example="Avatar 3: Lửa Và Tro Tàn"),
     *                 @OA\Property(property="slug", type="string", example="avatar-3"),
     *                 @OA\Property(property="poster", type="string", example="https://cdn.moveek.com/storage/media/cache/short/68d67eb92b88f227517456.jpg"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="release_date", type="string", example="19/12"),
     *                 @OA\Property(property="rating", type="string", example="93%"),
     *                 @OA\Property(property="genres", type="array", @OA\Items(type="string")),
     *                 @OA\Property(property="language", type="string", example="english"),
     *                 @OA\Property(property="page_url", type="string", example="https://moveek.com/phim/avatar-3/")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Movie not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Movie not found on Moveek")
     *         )
     *     )
     * )
     */
    public function getDetailFromMoveek($slug)
    {
        $this->authorize('viewAny', Movie::class);
        
        $service = new \App\Services\MoveekService();
        $movieDetail = $service->fetchMovieDetail($slug);
        
        if ($movieDetail) {
             return $this->response($movieDetail);
        }

        return $this->response(null, 'Movie not found on Moveek', 404);
    }

    protected function parseMovies($html)
    {
        $movies = [];
        
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        $items = $xpath->query('//div[contains(@class, "item") and contains(@class, "col-lg-2")]');
        
        foreach ($items as $item) {
            $movie = [];
            
            $likeButton = $xpath->query('.//a[contains(@class, "btn-do-movie-like")]', $item)->item(0);
            if ($likeButton instanceof \DOMElement) {
                $movie['id'] = (int) $likeButton->getAttribute('data-id');
            }
            
            $titleLink = $xpath->query('.//h3/a', $item)->item(0);
            if ($titleLink instanceof \DOMElement) {
                $movie['title'] = trim($titleLink->getAttribute('title') ?: $titleLink->textContent);
                $href = $titleLink->getAttribute('href');
                if (preg_match('/\/lich-chieu\/([^\/]+)\//', $href, $matches)) {
                    $movie['slug'] = $matches[1];
                }
            }
            
            $img = $xpath->query('.//img[@data-src]', $item)->item(0);
            if ($img instanceof \DOMElement) {
                $movie['poster'] = $img->getAttribute('data-src') ?: $img->getAttribute('src');
            }
            
            $dateNode = $xpath->query('.//div[contains(@class, "text-muted")]', $item)->item(0);
            if ($dateNode instanceof \DOMElement) {
                $movie['release_date'] = trim($dateNode->textContent);
            }
            
            $ratingLink = $xpath->query('.//a[contains(@href, "/review/")]', $item)->item(0);
            if ($ratingLink instanceof \DOMElement) {
                $ratingText = trim($ratingLink->textContent);
                if (preg_match('/(\d+)%/', $ratingText, $matches)) {
                    $movie['rating'] = $matches[1] . '%';
                }
            }
            
            $classes = $item->getAttribute('class');
            $genres = [];
            if (preg_match_all('/genre-([a-z-]+)/', $classes, $matches)) {
                $genres = $matches[1];
            }
            $movie['genres'] = $genres;
            
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
