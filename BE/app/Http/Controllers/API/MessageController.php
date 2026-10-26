<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Message\CreateMessageRequest;
use App\Http\Requests\Message\UpdateMessageRequest;
use App\Http\Resources\Message\MessageResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Message;
use App\Services\MessageService;

class MessageController extends Controller
{
    protected $service;

    public function __construct(MessageService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/messages",
     *     tags={"Messages"},
     *     summary="Get all messages",
     *     description="Get all messages",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="Hello")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[sender_id]=1&filters[receiver_id]=2",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"sender_id": "1", "receiver_id": "2"}
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
        $this->authorize("index", Message::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(MessageResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/messages",
     *     tags={"Messages"},
     *     summary="Send a message",
     *     description="Send a message",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"receiver_id", "content"},
     *             @OA\Property(property="receiver_id", type="integer", example=2),
     *             @OA\Property(property="content", type="string", example="Xin chào! Bạn có khỏe không?")
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
    public function create(CreateMessageRequest $request)
    {
        $this->authorize("create", Message::class);
        $data = $this->service->create($request->all());
        return $this->response(new MessageResource($data), statusCode: 201);
    }

    /**
     * @OA\Get(
     *     path="/api/messages/{id}",
     *     tags={"Messages"},
     *     summary="Get a message by ID",
     *     description="Get a message by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Message ID",
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
    public function show(Message $message)
    {
        $this->authorize("show", Message::class);
        $data = $this->service->find($message->id);
        return $this->response(new MessageResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/messages/{id}",
     *     tags={"Messages"},
     *     summary="Update a message",
     *     description="Update a message",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Message ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="content", type="string", example="Đã chỉnh sửa nội dung tin nhắn"),
     *             @OA\Property(property="is_read", type="boolean", example=true)
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
    public function update(UpdateMessageRequest $request, Message $message)
    {
        $this->authorize("update", $message);
        $data = $this->service->update($request->all(), $message->id);
        return $this->response(new MessageResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/messages/{id}",
     *     tags={"Messages"},
     *     summary="Delete a message",
     *     description="Delete a message",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Message ID",
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
    public function destroy(Message $message)
    {
        $this->authorize("destroy", $message);
        $this->service->delete($message->id);
        $data = [];
        return $this->response($data);
    }
}
