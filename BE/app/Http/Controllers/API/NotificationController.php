<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\CreateNotificationRequest;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Http\Resources\Notification\NotificationResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    protected $service;

    public function __construct(NotificationService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/notifications",
     *     tags={"Notifications"},
     *     summary="Get all notifications",
     *     description="Get all notifications",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         required=false,
     *         description="Search keyword",
     *         @OA\Schema(type="string", example="New message")
     *     ),
     *     @OA\Parameter(
     *         name="filters",
     *         in="query",
     *         required=false,
     *         description="Dynamic filter object. Example: filters[user_id]=1&filters[type]=general",
     *         style="deepObject",
     *         explode=true,
     *         @OA\Schema(
     *             type="object",
     *             additionalProperties={
     *                 "type"="string"
     *             },
     *             example={"user_id": "1", "type": "general"}
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
        $this->authorize("index", Notification::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(NotificationResource::collection($data)));
    }

    /**
     * @OA\Post(
     *     path="/api/notifications",
     *     tags={"Notifications"},
     *     summary="Create a new notification",
     *     description="Create a new notification",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "message"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="title", type="string", example="Thông báo mới"),
     *             @OA\Property(property="message", type="string", example="Bạn có một tin nhắn mới từ người dùng"),
     *             @OA\Property(property="type", type="string", example="message"),
     *             @OA\Property(property="data", type="object", example={"sender_id": 2, "message_id": 123}),
     *             @OA\Property(property="expires_at", type="string", format="date-time", example="2024-12-31T23:59:59Z")
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
    public function create(CreateNotificationRequest $request)
    {
        $this->authorize("create", Notification::class);
        $data = $this->service->create($request->all());
        return $this->response(new NotificationResource($data), statusCode: 201);
    }

    /**
     * @OA\Post(
     *     path="/api/notifications/test",
     *     tags={"Notifications"},
     *     summary="Send a test push notification (FCM)",
     *     description="Send a test push notification to the target user (or current user if user_id not provided). Requires valid FCM server key and registered device tokens. The notification will be queued and sent via FCM.",
     *     operationId="testNotification",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "body"},
     *             @OA\Property(property="title", type="string", example="Test notification", description="Notification title"),
     *             @OA\Property(property="body", type="string", example="Hello from backend", description="Notification body/message", maxLength=1000),
     *             @OA\Property(property="user_id", type="integer", example=1, nullable=true, description="Target user ID; defaults to current authenticated user if not provided"),
     *             @OA\Property(property="data", type="object", example={"foo": "bar", "action": "test"}, description="Additional data payload for the notification", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Push notification dispatched successfully (queued)",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Push notification dispatched"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user_id", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error or no target user specified",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function testSend(Request $request)
    {
        $this->authorize("create", Notification::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
            'user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'data' => 'nullable|array',
        ]);

        $targetUserId = $validated['user_id'] ?? $request->user()?->id;
        if (!$targetUserId) {
            return $this->errorResponse('No target user specified', null, 422);
        }

        // Queue send
        $this->service->dispatchPushToUser(
            $targetUserId,
            $validated['title'],
            $validated['body'],
            $validated['data'] ?? []
        );

        return $this->response([
            'user_id' => $targetUserId,
        ], 'Push notification dispatched');
    }

    /**
     * @OA\Get(
     *     path="/api/notifications/{id}",
     *     tags={"Notifications"},
     *     summary="Get a notification by ID",
     *     description="Get a notification by ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Notification ID",
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
    public function show(Notification $notification)
    {
        $this->authorize("show", Notification::class);
        $data = $this->service->find($notification->id);
        return $this->response(new NotificationResource($data));
    }

    /**
     * @OA\Put(
     *     path="/api/notifications/{id}",
     *     tags={"Notifications"},
     *     summary="Update a notification",
     *     description="Update a notification (mark as read)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Notification ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Thông báo đã cập nhật"),
     *             @OA\Property(property="message", type="string", example="Nội dung thông báo đã được cập nhật"),
     *             @OA\Property(property="type", type="string", example="system"),
     *             @OA\Property(property="data", type="object", example={"action": "update"}),
     *             @OA\Property(property="is_read", type="boolean", example=true),
     *             @OA\Property(property="expires_at", type="string", format="date-time", example="2024-12-31T23:59:59Z")
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
    public function update(UpdateNotificationRequest $request, Notification $notification)
    {
        $this->authorize("update", $notification);
        $data = $this->service->update($request->all(), $notification->id);
        return $this->response(new NotificationResource($data));
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications/{id}",
     *     tags={"Notifications"},
     *     summary="Delete a notification",
     *     description="Delete a notification",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Notification ID",
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
    public function destroy(Notification $notification)
    {
        $this->authorize("destroy", $notification);
        $this->service->delete($notification->id);
        $data = [];
        return $this->response($data);
    }
}
