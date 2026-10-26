<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Friendship\CreateFriendshipRequest;
use App\Http\Requests\Friendship\UpdateFriendshipRequest;
use App\Http\Resources\Friendship\FriendshipResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Friendship;
use App\Services\FriendshipService;

class FriendshipController extends Controller
{
    protected $service;

    public function __construct(FriendshipService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/friendships",
     *     tags={"Friendships"},
     *     summary="Get all friendships",
     *     description="Get all friendships",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="John")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[status]=accepted",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "status": "accepted"}
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
        $this->authorize("index", Friendship::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(FriendshipResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/friendships",
     *     tags={"Friendships"},
     *     summary="Send a friend request",
     *     description="Send a friend request",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"friend_id"},
     *             @OA\Property(property="friend_id", type="integer", example=2),
     *             @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"}, example="pending")
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
    public function create(CreateFriendshipRequest $request)
    {
        $this->authorize("create", Friendship::class);
        $data = $this->service->create($request->all());
        return $this->response(new FriendshipResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/friendships/{id}",
     *     tags={"Friendships"},
     *     summary="Get a friendship by ID",
     *     description="Get a friendship by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Friendship ID",
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
    public function show(Friendship $friendship)
    {
        $this->authorize("show", Friendship::class);
        $data = $this->service->find($friendship->id);
        return $this->response(new FriendshipResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/friendships/{id}",
     *     tags={"Friendships"},
     *     summary="Update friendship status",
     *     description="Update friendship status (accept/reject friend request)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Friendship ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", enum={"pending", "accepted", "rejected"}, example="accepted")
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
    public function update(UpdateFriendshipRequest $request, Friendship $friendship)
    {
        $this->authorize("update", $friendship);
        $data = $this->service->update($request->all(), $friendship->id);
        return $this->response(new FriendshipResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/friendships/{id}",
     *     tags={"Friendships"},
     *     summary="Delete a friendship",
     *     description="Delete a friendship",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Friendship ID",
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
    public function destroy(Friendship $friendship)
    {
        $this->authorize("destroy", $friendship);
        $this->service->delete($friendship->id);
        $data = [];
        return $this->response($data);
    }
}
