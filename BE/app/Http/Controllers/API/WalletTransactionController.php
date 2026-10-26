<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\WalletTransaction\CreateWalletTransactionRequest;
use App\Http\Requests\WalletTransaction\UpdateWalletTransactionRequest;
use App\Http\Resources\WalletTransaction\WalletTransactionResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\WalletTransaction;
use App\Services\WalletTransactionService;

class WalletTransactionController extends Controller
{
    protected $service;

    public function __construct(WalletTransactionService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/wallet-transactions",
     *     tags={"Wallet Transactions"},
     *     summary="Get all wallet transactions",
     *     description="Get all wallet transactions",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="earn")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[wallet_id]=1&filters[type]=earn",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"wallet_id": "1", "type": "earn"}
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
        $this->authorize("index", WalletTransaction::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(WalletTransactionResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/wallet-transactions",
     *     tags={"Wallet Transactions"},
     *     summary="Create a new wallet transaction",
     *     description="Create a new wallet transaction (earn/spend points)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"wallet_id", "type", "amount"},
     *             @OA\Property(property="wallet_id", type="integer", example=1),
     *             @OA\Property(property="type", type="string", example="earn", enum={"earn", "spend"}),
     *             @OA\Property(property="amount", type="integer", example=100),
     *             @OA\Property(property="description", type="string", example="Earned points for completing a task"),
     *             @OA\Property(property="reference_type", type="string", example="task_completion"),
     *             @OA\Property(property="reference_id", type="integer", example=123)
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
    public function create(CreateWalletTransactionRequest $request)
    {
        $this->authorize("create", WalletTransaction::class);
        $data = $this->service->create($request->all());
        return $this->response(new WalletTransactionResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/wallet-transactions/{id}",
     *     tags={"Wallet Transactions"},
     *     summary="Get a wallet transaction by ID",
     *     description="Get a wallet transaction by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet Transaction ID",
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
    public function show(WalletTransaction $walletTransaction)
    {
        $this->authorize("show", $walletTransaction);
        $data = $this->service->find($walletTransaction->id);
        return $this->response(new WalletTransactionResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/wallet-transactions/{id}",
     *     tags={"Wallet Transactions"},
     *     summary="Update a wallet transaction",
     *     description="Update a wallet transaction",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet Transaction ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="description", type="string", example="Updated transaction description"),
     *             @OA\Property(property="reference_type", type="string", example="updated_reference"),
     *             @OA\Property(property="reference_id", type="integer", example=456)
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
    public function update(UpdateWalletTransactionRequest $request, WalletTransaction $walletTransaction)
    {
        $this->authorize("update", $walletTransaction);
        $data = $this->service->update($request->all(), $walletTransaction->id);
        return $this->response(new WalletTransactionResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/wallet-transactions/{id}",
     *     tags={"Wallet Transactions"},
     *     summary="Delete a wallet transaction",
     *     description="Delete a wallet transaction",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Wallet Transaction ID",
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
    public function destroy(WalletTransaction $walletTransaction)
    {
        $this->authorize("destroy", $walletTransaction);
        $this->service->delete($walletTransaction->id);
        $data = [];
        return $this->response($data);
    }
}
