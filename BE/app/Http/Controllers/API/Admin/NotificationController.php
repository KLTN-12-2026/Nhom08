<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Notification\NotificationResource;
use App\Http\Requests\SearchFilterRequest;
use App\Http\Requests\Admin\Notification\SendToUserNotificationRequest;
use App\Http\Requests\Admin\Notification\SendToUsersNotificationRequest;
use App\Http\Requests\Admin\Notification\SendBroadcastNotificationRequest;
use App\Http\Resources\PaginationResource;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    protected $service;

    public function __construct(NotificationService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/notifications",
     *     tags={"Admin - Notifications"},
     *     summary="Get all notifications (Admin)",
     *     description="Retrieve all notifications with pagination and filtering. Admin can view all users' notifications.",
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
     *                 type="object"
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
     * @OA\Get(
     *     path="/api/admin/notifications/{id}",
     *     tags={"Admin - Notifications"},
     *     summary="Get notification details (Admin)",
     *     description="Retrieve detailed information about a specific notification",
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
     *             @OA\Property(property="data", type="object")
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
     * @OA\Post(
     *     path="/api/admin/notifications/send-to-user",
     *     tags={"Admin - Notifications"},
     *     summary="Send notification to a specific user (Admin)",
     *     description="Admin can send a notification to a specific user. The notification will be saved to database and pushed via FCM if user has device tokens.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "title", "message"},
     *             @OA\Property(property="user_id", type="integer", example=1, description="Target user ID"),
     *             @OA\Property(property="title", type="string", example="Thông báo từ Admin", description="Notification title"),
     *             @OA\Property(property="message", type="string", example="Đây là thông báo quan trọng từ quản trị viên", description="Notification message"),
     *             @OA\Property(property="type", type="string", example="admin", description="Notification type", nullable=true),
     *             @OA\Property(property="data", type="object", example={"action": "update", "link": "/settings"}, description="Additional data payload", nullable=true),
     *             @OA\Property(property="push", type="boolean", example=true, description="Whether to send FCM push notification (default: true)", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Notification sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Notification sent successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function sendToUser(SendToUserNotificationRequest $request)
    {
        $this->authorize("create", Notification::class);

        $validated = $request->validated();

        $notification = $this->service->createAndNotify(
            $validated['user_id'],
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'admin',
            $validated['data'] ?? [],
            $validated['push'] ?? true
        );

        return $this->response(new NotificationResource($notification), 'Notification sent successfully', 201);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/notifications/send-to-users",
     *     tags={"Admin - Notifications"},
     *     summary="Send notification to multiple users (Admin)",
     *     description="Admin can send a notification to multiple users at once. The notification will be saved to database and pushed via FCM for each user.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_ids", "title", "message"},
     *             @OA\Property(property="user_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3}, description="Array of target user IDs"),
     *             @OA\Property(property="title", type="string", example="Thông báo từ Admin", description="Notification title"),
     *             @OA\Property(property="message", type="string", example="Đây là thông báo quan trọng từ quản trị viên", description="Notification message"),
     *             @OA\Property(property="type", type="string", example="admin", description="Notification type", nullable=true),
     *             @OA\Property(property="data", type="object", example={"action": "update", "link": "/settings"}, description="Additional data payload", nullable=true),
     *             @OA\Property(property="push", type="boolean", example=true, description="Whether to send FCM push notification (default: true)", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Notifications sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Notifications sent successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="count", type="integer", example=3),
     *                 @OA\Property(property="notifications", type="array", @OA\Items())
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function sendToUsers(SendToUsersNotificationRequest $request)
    {
        $this->authorize("create", Notification::class);

        $validated = $request->validated();

        $notifications = $this->service->createAndNotifyMultiple(
            $validated['user_ids'],
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'admin',
            $validated['data'] ?? [],
            $validated['push'] ?? true
        );

        return $this->response([
            'count' => count($notifications),
            'notifications' => NotificationResource::collection($notifications),
        ], 'Notifications sent successfully', 201);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/notifications/broadcast",
     *     tags={"Admin - Notifications"},
     *     summary="Send broadcast notification to all users (Admin)",
     *     description="Admin can send a broadcast notification to all active, non-blocked users. This will create a notification for each user and push via FCM.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "message"},
     *             @OA\Property(property="title", type="string", example="Thông báo hệ thống", description="Notification title"),
     *             @OA\Property(property="message", type="string", example="Hệ thống sẽ bảo trì vào ngày mai", description="Notification message"),
     *             @OA\Property(property="type", type="string", example="system", description="Notification type", nullable=true),
     *             @OA\Property(property="data", type="object", example={"action": "maintenance", "date": "2024-12-25"}, description="Additional data payload", nullable=true),
     *             @OA\Property(property="push", type="boolean", example=true, description="Whether to send FCM push notification (default: true)", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Broadcast notification sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Broadcast notification sent successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="count", type="integer", example=150, description="Number of users who received the notification")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function sendBroadcast(SendBroadcastNotificationRequest $request)
    {
        $this->authorize("create", Notification::class);

        $validated = $request->validated();

        $notifications = $this->service->createAndNotifyBroadcast(
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'system',
            $validated['data'] ?? [],
            $validated['push'] ?? true
        );

        return $this->response([
            'count' => count($notifications),
        ], 'Broadcast notification sent successfully', 201);
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/notifications/{id}",
     *     tags={"Admin - Notifications"},
     *     summary="Delete a notification (Admin)",
     *     description="Delete a notification. Admin can delete any notification.",
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
     *         description="Notification deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Notification deleted successfully"),
     *             @OA\Property(property="data", type="object", example=null)
     *         )
     *     )
     * )
     */
    public function destroy(Notification $notification)
    {
        $this->authorize("destroy", Notification::class);
        $this->service->delete($notification->id);
        return $this->response(null, 'Notification deleted successfully');
    }
}

