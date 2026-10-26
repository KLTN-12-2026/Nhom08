<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeviceToken\CreateDeviceTokenRequest;
use App\Http\Requests\DeviceToken\UpdateDeviceTokenRequest;
use App\Http\Resources\DeviceToken\DeviceTokenResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\DeviceToken;
use App\Services\DeviceTokenService;

class DeviceTokenController extends Controller
{
    protected $service;

    public function __construct(DeviceTokenService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/device-tokens",
     *     tags={"Device Tokens"},
     *     summary="Get all device tokens",
     *     description="Get all device tokens",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="ios")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[platform]=ios",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "platform": "ios"}
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
        $this->authorize("index", DeviceToken::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(DeviceTokenResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/device-tokens",
     *     tags={"Device Tokens"},
     *     summary="Register a device token",
     *     description="Register a device token for push notifications",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token"},
     *             @OA\Property(property="token", type="string", example="fcm_token_example_123456789"),
     *             @OA\Property(property="platform", type="string", example="ios", enum={"ios", "android", "web"})
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
    public function create(CreateDeviceTokenRequest $request)
    {
        $this->authorize("create", DeviceToken::class);
        // Always set user_id from authenticated user
        $data = $request->all();
        $data['user_id'] = $request->user()->id;
        $data = $this->service->create($data);
        return $this->response(new DeviceTokenResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/device-tokens/{id}",
     *     tags={"Device Tokens"},
     *     summary="Get a device token by ID",
     *     description="Get a device token by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Device Token ID",
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
    public function show(DeviceToken $deviceToken)
    {
        $this->authorize("show", DeviceToken::class);
        $data = $this->service->find($deviceToken->id);
        return $this->response(new DeviceTokenResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/device-tokens/{id}",
     *     tags={"Device Tokens"},
     *     summary="Update a device token",
     *     description="Update a device token",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Device Token ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="token", type="string", example="updated_fcm_token_123456789"),
     *             @OA\Property(property="platform", type="string", example="android", enum={"ios", "android", "web"}),
     *             @OA\Property(property="is_active", type="boolean", example=true)
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
    public function update(UpdateDeviceTokenRequest $request, DeviceToken $deviceToken)
    {
        $this->authorize("update", $deviceToken);
        $data = $this->service->update($request->all(), $deviceToken->id);
        return $this->response(new DeviceTokenResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/device-tokens/{id}",
     *     tags={"Device Tokens"},
     *     summary="Delete a device token",
     *     description="Delete a device token",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Device Token ID",
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
    public function destroy(DeviceToken $deviceToken)
    {
        $this->authorize("destroy", $deviceToken);
        $this->service->delete($deviceToken->id);
        $data = [];
        return $this->response($data);
    }
}
