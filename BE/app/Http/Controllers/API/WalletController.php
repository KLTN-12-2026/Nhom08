<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\CreateWalletRequest;
use App\Http\Requests\Wallet\UpdateWalletRequest;
use App\Http\Resources\Wallet\WalletResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Wallet;
use App\Services\WalletService;

class WalletController extends Controller
{
    protected $service;

    public function __construct(WalletService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/wallets",
     *     tags={"Wallets"},
     *     summary="Get all wallets",
     *     description="Get all wallets",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="user123")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[level]=5",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "level": "5"}
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         required=false,
     *         description="Field to sort by",
     *         @OA\Schema(type="string", example="points")
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
        $this->authorize("index", Wallet::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(WalletResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/wallets",
     *     tags={"Wallets"},
     *     summary="Create a new wallet",
     *     description="Create a new wallet for a user",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="points", type="integer", example=100),
     *             @OA\Property(property="level", type="integer", example=1),
     *             @OA\Property(property="total_earned", type="integer", example=0),
     *             @OA\Property(property="total_spent", type="integer", example=0)
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
    public function create(CreateWalletRequest $request)
    {
        $this->authorize("create", Wallet::class);
        $data = $this->service->create($request->all());
        return $this->response(new WalletResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/wallets/{id}",
     *     tags={"Wallets"},
     *     summary="Get a wallet by ID",
     *     description="Get a wallet by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet ID",
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
    public function show(Wallet $wallet)
    {
        $this->authorize("show", $wallet);
        $data = $this->service->find($wallet->id);
        return $this->response(new WalletResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/wallets/{id}",
     *     tags={"Wallets"},
     *     summary="Update a wallet",
     *     description="Update a wallet",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="points", type="integer", example=150),
     *             @OA\Property(property="level", type="integer", example=2),
     *             @OA\Property(property="total_earned", type="integer", example=200),
     *             @OA\Property(property="total_spent", type="integer", example=50)
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
    public function update(UpdateWalletRequest $request, Wallet $wallet)
    {
        $this->authorize("update", $wallet);
        $data = $this->service->update($request->all(), $wallet->id);
        return $this->response(new WalletResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/wallets/{id}",
     *     tags={"Wallets"},
     *     summary="Delete a wallet",
     *     description="Delete a wallet",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet ID",
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
    public function destroy(Wallet $wallet)
    {
        $this->authorize("destroy", $wallet);
        $this->service->delete($wallet->id);
        $data = [];
        return $this->response($data);
    }
}
