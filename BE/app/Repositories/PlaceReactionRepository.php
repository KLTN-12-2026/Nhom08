<?php

namespace App\Repositories;

use App\Models\PlaceReaction;
use App\Enums\ReactionType;
use Illuminate\Support\Facades\DB;

class PlaceReactionRepository extends BaseRepository
{
    public function __construct(PlaceReaction $model)
    {
        parent::__construct($model);
    }

    /**
     * Find user's reaction for a specific place
     */
    public function findByUserAndPlace(int $userId, int $placeId): ?PlaceReaction
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('place_id', $placeId)
            ->first();
    }

    /**
     * Toggle reaction: create, update, or delete based on current state
     * Returns the reaction if created/updated, null if deleted
     */
    public function toggleReaction(int $userId, int $placeId, ReactionType $reactionType): ?PlaceReaction
    {
        $existing = $this->findByUserAndPlace($userId, $placeId);

        if ($existing) {
            // If same reaction type, remove it (toggle off)
            if ($existing->reaction_type === $reactionType) {
                $existing->delete();
                return null;
            }
            
            // Different reaction type, update it
            $existing->update(['reaction_type' => $reactionType]);
            return $existing->fresh();
        }

        // No existing reaction, create new one
        return $this->model->create([
            'user_id' => $userId,
            'place_id' => $placeId,
            'reaction_type' => $reactionType,
        ]);
    }

    /**
     * Get reaction statistics for a place
     */
    public function getPlaceStats(int $placeId): array
    {
        $stats = $this->model
            ->where('place_id', $placeId)
            ->select('reaction_type', DB::raw('count(*) as count'))
            ->groupBy('reaction_type')
            ->get()
            ->keyBy('reaction_type');

        $badCount = $stats->get(ReactionType::BAD->value)?->count ?? 0;
        $normalCount = $stats->get(ReactionType::NORMAL->value)?->count ?? 0;
        $goodCount = $stats->get(ReactionType::GOOD->value)?->count ?? 0;
        $total = $badCount + $normalCount + $goodCount;

        return [
            'total_reactions' => $total,
            'bad_count' => $badCount,
            'normal_count' => $normalCount,
            'good_count' => $goodCount,
            'bad_percentage' => $total > 0 ? round(($badCount / $total) * 100, 2) : 0,
            'normal_percentage' => $total > 0 ? round(($normalCount / $total) * 100, 2) : 0,
            'good_percentage' => $total > 0 ? round(($goodCount / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get reaction statistics for multiple places (bulk operation)
     */
    public function getPlacesStats(array $placeIds): array
    {
        if (empty($placeIds)) {
            return [];
        }

        $stats = $this->model
            ->whereIn('place_id', $placeIds)
            ->select('place_id', 'reaction_type', DB::raw('count(*) as count'))
            ->groupBy('place_id', 'reaction_type')
            ->get()
            ->groupBy('place_id');

        $result = [];
        foreach ($placeIds as $placeId) {
            $placeStats = $stats->get($placeId, collect());
            
            $badCount = $placeStats->where('reaction_type', ReactionType::BAD->value)->first()?->count ?? 0;
            $normalCount = $placeStats->where('reaction_type', ReactionType::NORMAL->value)->first()?->count ?? 0;
            $goodCount = $placeStats->where('reaction_type', ReactionType::GOOD->value)->first()?->count ?? 0;
            $total = $badCount + $normalCount + $goodCount;

            $result[$placeId] = [
                'total_reactions' => $total,
                'bad_count' => $badCount,
                'normal_count' => $normalCount,
                'good_count' => $goodCount,
                'bad_percentage' => $total > 0 ? round(($badCount / $total) * 100, 2) : 0,
                'normal_percentage' => $total > 0 ? round(($normalCount / $total) * 100, 2) : 0,
                'good_percentage' => $total > 0 ? round(($goodCount / $total) * 100, 2) : 0,
            ];
        }

        return $result;
    }

    /**
     * Delete user's reaction for a place
     */
    public function deleteUserReaction(int $userId, int $placeId): bool
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('place_id', $placeId)
            ->delete() > 0;
    }
}
