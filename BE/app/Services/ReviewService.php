<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\ReviewRepository;
use App\Services\NotificationService;

class ReviewService extends BaseService
{
    protected $repository;
    protected $notificationService;

    public function __construct(ReviewRepository $repository, NotificationService $notificationService)
    {
        parent::__construct($repository);
        $this->notificationService = $notificationService;
    }

    public function create(array $data)
    {
        $mediaIds = $data['media_ids'] ?? null;
        unset($data['media_ids']);
        
        $review = parent::create($data);
        
        // Liên kết media với review nếu có media_ids
        if ($mediaIds !== null && is_array($mediaIds) && !empty($mediaIds)) {
            Media::whereIn('id', $mediaIds)
                ->where('review_id', null)
                ->update(['review_id' => $review->id]);
        }
        
        $review->load(['user', 'place', 'media']);

        // Tạo notification + push cho chủ địa điểm khi có bình luận mới
        if ($review->place && $review->place->user_id) {
            $ownerId = $review->place->user_id;
            $actorId = $review->user_id;
            if ($ownerId !== $actorId) { // tránh tự gửi cho chính mình
                $title = 'Bình luận mới về địa điểm của bạn';
                $body = sprintf(
                    '%s đã bình luận: %s',
                    $review->user?->name ?? 'Người dùng',
                    mb_strimwidth($review->comment ?? '', 0, 80, '...')
                );
                $this->notificationService->createAndNotify(
                    $ownerId,
                    $title,
                    $body,
                    'review_created',
                    [
                        'place_id' => $review->place->id,
                        'review_id' => $review->id,
                        'actor_id' => $actorId,
                    ],
                    true // push
                );
            }
        }

        return $review;
    }

    public function update(array $data, $id)
    {
        $hasMediaIds = array_key_exists('media_ids', $data);
        $mediaIds = $data['media_ids'] ?? null;
        unset($data['media_ids']);
        
        $review = parent::update($data, $id);
        
        // Cập nhật media nếu có media_ids được gửi (kể cả mảng rỗng)
        if ($hasMediaIds) {
            // Xóa liên kết cũ
            Media::where('review_id', $review->id)->update(['review_id' => null]);
            
            // Liên kết media mới nếu có
            if ($mediaIds !== null && is_array($mediaIds) && !empty($mediaIds)) {
                Media::whereIn('id', $mediaIds)->update(['review_id' => $review->id]);
            }
        }
        
        if ($review) {
            $review->load(['user', 'place', 'media']);
        }
        
        return $review;
    }
}
