<?php

namespace App\Services;

use App\Repositories\NotificationRepository;
use App\Services\FcmService;
use App\Services\DeviceTokenService;
use App\Jobs\SendFcmNotificationJob;

class NotificationService extends BaseService
{
    protected $repository;
    protected $fcmService;
    protected $deviceTokenService;

    public function __construct(
        NotificationRepository $repository,
        FcmService $fcmService,
        DeviceTokenService $deviceTokenService
    )
    {
        parent::__construct($repository);
        $this->fcmService = $fcmService;
        $this->deviceTokenService = $deviceTokenService;
    }

    /**
     * Send push notification to a user (all active device tokens).
     */
    public function sendPushToUser(int $userId, string $title, string $body, array $data = []): array
    {
        $tokens = $this->deviceTokenService->getTokensByUser($userId, true);
        if (empty($tokens)) {
            return ['success' => 0, 'failure' => 0, 'raw' => 'no_tokens'];
        }

        return $this->fcmService->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * Dispatch push notification job (queue) to a user.
     */
    public function dispatchPushToUser(int $userId, string $title, string $body, array $data = []): void
    {
        $tokens = $this->deviceTokenService->getTokensByUser($userId, true);
        
        \Illuminate\Support\Facades\Log::info('NotificationService: dispatchPushToUser', [
            'user_id' => $userId,
            'tokens_count' => count($tokens),
            'tokens' => $tokens,
            'title' => $title,
            'body' => $body,
            'has_tokens' => !empty($tokens),
        ]);
        
        if (empty($tokens)) {
            \Illuminate\Support\Facades\Log::warning('NotificationService: No device tokens found for user', [
                'user_id' => $userId,
            ]);
            return;
        }

        SendFcmNotificationJob::dispatch($tokens, $title, $body, $data);
    }

    /**
     * Create notification in DB and optionally push to user's devices (queued).
     *
     * @param int         $userId
     * @param string      $title
     * @param string      $message
     * @param string|null $type
     * @param array       $data
     * @param bool        $push  Whether to send FCM push (default true)
     * @return \App\Models\Notification
     */
    public function createAndNotify(
        int $userId,
        string $title,
        string $message,
        ?string $type = null,
        array $data = [],
        bool $push = true
    ) {
        $notification = $this->create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'is_read' => false,
        ]);

        if ($push) {
            $this->dispatchPushToUser($userId, $title, $message, array_merge($data, [
                'notification_id' => $notification->id,
                'type' => $type,
            ]));
        }

        return $notification;
    }

    /**
     * Send notification to multiple users (queued).
     *
     * @param array  $userIds Array of user IDs
     * @param string $title
     * @param string $message
     * @param string|null $type
     * @param array  $data
     * @param bool   $push Whether to send FCM push (default true)
     * @return array Array of created notifications
     */
    public function createAndNotifyMultiple(
        array $userIds,
        string $title,
        string $message,
        ?string $type = null,
        array $data = [],
        bool $push = true
    ): array {
        $notifications = [];

        foreach ($userIds as $userId) {
            $notification = $this->createAndNotify($userId, $title, $message, $type, $data, $push);
            $notifications[] = $notification;
        }

        return $notifications;
    }

    /**
     * Send broadcast notification to all active users (queued).
     *
     * @param string      $title
     * @param string      $message
     * @param string|null $type
     * @param array       $data
     * @param bool        $push Whether to send FCM push (default true)
     * @return array Array of created notifications
     */
    public function createAndNotifyBroadcast(
        string $title,
        string $message,
        ?string $type = null,
        array $data = [],
        bool $push = true
    ): array {
        // Get all active users
        $users = \App\Models\User::where('is_active', true)
            ->where('is_blocked', false)
            ->pluck('id')
            ->toArray();

        return $this->createAndNotifyMultiple($users, $title, $message, $type, $data, $push);
    }
}
