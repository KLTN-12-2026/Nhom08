<?php

namespace App\Services;

use App\Repositories\PlaceReactionRepository;
use App\Enums\ReactionType;
use App\Models\PlaceReaction;

class PlaceReactionService extends BaseService
{
    protected $repository;

    public function __construct(PlaceReactionRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Toggle user's reaction for a place
     * Returns the reaction if created/updated, null if removed
     */
    public function toggleReaction(int $userId, int $placeId, ReactionType $reactionType): ?PlaceReaction
    {
        return $this->repository->toggleReaction($userId, $placeId, $reactionType);
    }

    /**
     * Get user's current reaction for a place
     */
    public function getMyReaction(int $userId, int $placeId): ?PlaceReaction
    {
        return $this->repository->findByUserAndPlace($userId, $placeId);
    }

    /**
     * Get reaction statistics for a place
     */
    public function getPlaceStats(int $placeId, ?int $userId = null): array
    {
        $stats = $this->repository->getPlaceStats($placeId);
        
        // Add user's reaction if userId provided
        if ($userId) {
            $myReaction = $this->repository->findByUserAndPlace($userId, $placeId);
            $stats['my_reaction'] = $myReaction?->reaction_type?->value;
        } else {
            $stats['my_reaction'] = null;
        }
        
        $stats['place_id'] = $placeId;
        
        return $stats;
    }

    /**
     * Get reaction statistics for multiple places (bulk operation)
     */
    public function bulkGetStats(array $placeIds, ?int $userId = null): array
    {
        $stats = $this->repository->getPlacesStats($placeIds);
        
        // Add user's reactions if userId provided
        if ($userId && !empty($placeIds)) {
            $userReactions = PlaceReaction::where('user_id', $userId)
                ->whereIn('place_id', $placeIds)
                ->get()
                ->keyBy('place_id');
            
            foreach ($stats as $placeId => &$stat) {
                $stat['place_id'] = $placeId;
                $stat['my_reaction'] = $userReactions->get($placeId)?->reaction_type?->value;
            }
        } else {
            foreach ($stats as $placeId => &$stat) {
                $stat['place_id'] = $placeId;
                $stat['my_reaction'] = null;
            }
        }
        
        return $stats;
    }

    /**
     * Delete user's reaction for a place
     */
    public function deleteReaction(int $userId, int $placeId): bool
    {
        return $this->repository->deleteUserReaction($userId, $placeId);
    }
}
