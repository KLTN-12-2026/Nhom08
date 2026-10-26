<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Movie\MovieResource;
use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/movies/{slug}",
     *     tags={"Movies"},
     *     summary="Get movie details",
     *     description="Get detailed information about a specific movie by slug",
     *     @OA\Parameter(
     *         name="slug",
     *         in="path",
     *         required=true,
     *         description="Movie Slug",
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
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Not Found"
     *     )
     * )
     */
    public function show($slug)
    {
      
        // Fallback to Moveek
        $service = new \App\Services\MoveekService();
        $details = $service->fetchMovieDetail($slug);
        
        if ($details) {
            $details['is_active'] = true;
            return $this->response($details);
        }

        return $this->response(null, 'Movie not found', 404);
    }
}
