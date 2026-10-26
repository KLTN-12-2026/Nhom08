<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\FavoritePlace\CreateFavoritePlaceRequest;
use App\Http\Requests\FavoritePlace\UpdateFavoritePlaceRequest;
use App\Http\Resources\FavoritePlace\FavoritePlaceResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\FavoritePlace;
use App\Services\FavoritePlaceService;

class FavoritePlaceController extends Controller
{
    protected $service;

    public function __construct(FavoritePlaceService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/favorite-places",
     *     tags={"Favorite Places"},
     *     summary="Get all favorite places",
     *     description="Get all favorite places",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Coffee")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[place_id]=1",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "place_id": "1"}
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
        $this->authorize("index", FavoritePlace::class);
        $data = $this->service->all($request);
        $data->load('place');
        return $this->response(new PaginationResource(FavoritePlaceResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/favorite-places",
     *     tags={"Favorite Places"},
     *     summary="Add a place to favorites",
     *     description="Add a place to favorites",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"place_id"},
     *             @OA\Property(property="place_id", type="integer", example=1)
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
    public function create(CreateFavoritePlaceRequest $request)
    {
        $this->authorize("create", FavoritePlace::class);
        $data = $this->service->create($request->all());
        return $this->response(new FavoritePlaceResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/favorite-places/{id}",
     *     tags={"Favorite Places"},
     *     summary="Get a favorite place by ID",
     *     description="Get a favorite place by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Favorite Place ID",
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
    public function show(FavoritePlace $favoritePlace)
    {
        $this->authorize("show", FavoritePlace::class);
        $data = $this->service->find($favoritePlace->id);
        return $this->response(new FavoritePlaceResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/favorite-places/{id}",
     *     tags={"Favorite Places"},
     *     summary="Update a favorite place",
     *     description="Update a favorite place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Favorite Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="place_id", type="integer", example=2)
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
    public function update(UpdateFavoritePlaceRequest $request, FavoritePlace $favoritePlace)
    {
        $this->authorize("update", $favoritePlace);
        $data = $this->service->update($request->all(), $favoritePlace->id);
        return $this->response(new FavoritePlaceResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/favorite-places/{id}",
     *     tags={"Favorite Places"},
     *     summary="Remove a place from favorites",
     *     description="Remove a place from favorites",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Favorite Place ID",
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
    public function destroy(FavoritePlace $favoritePlace)
    {
        $this->authorize("destroy", $favoritePlace);
        $this->service->delete($favoritePlace->id);
        $data = [];
        return $this->response($data);
    }

    /**
     * @OA\Post(
     *     path="/api/favorite-places/toggle",
     *     tags={"Favorite Places"},
     *     summary="Toggle favorite place",
     *     description="Add place to favorites if not favorited, remove if already favorited",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"place_id"},
     *             @OA\Property(property="place_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Place added to favorites"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="is_favorited", type="boolean", example=true),
     *                 @OA\Property(property="data", type="object", description="Favorite place data if added")
     *             )
     *         )
     *     )
     * )
     */
    public function toggle(\Illuminate\Http\Request $request)
    {
        $this->authorize("create", FavoritePlace::class);
        
        $request->validate([
            'place_id' => 'required|integer|exists:places,id'
        ]);

        $userId = $request->user()->id;
        $placeId = $request->input('place_id');
        
        $result = $this->service->toggle($userId, $placeId);
        
        return $this->response($result, $result['message']);
    }
}
