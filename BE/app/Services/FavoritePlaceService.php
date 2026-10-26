<?php

namespace App\Services;

use App\Models\FavoritePlace;
use App\Repositories\FavoritePlaceRepository;

class FavoritePlaceService extends BaseService
{
    protected $repository;

    public function __construct(FavoritePlaceRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Toggle favorite place - add if not exists, remove if exists
     */
    public function toggle($userId, $placeId)
    {
        $favoritePlace = FavoritePlace::where('user_id', $userId)
            ->where('place_id', $placeId)
            ->first();

        if ($favoritePlace) {
            // Remove from favorites
            $this->repository->delete($favoritePlace->id);
            return [
                'is_favorited' => false,
                'message' => 'Place removed from favorites'
            ];
        } else {
            // Add to favorites
            $favoritePlace = $this->repository->create([
                'user_id' => $userId,
                'place_id' => $placeId
            ]);
            return [
                'is_favorited' => true,
                'data' => $favoritePlace,
                'message' => 'Place added to favorites'
            ];
        }
    }
}
