<?php

namespace App\Repositories;

use App\Models\FavoritePlace;

class FavoritePlaceRepository extends BaseRepository
{
    public function __construct(FavoritePlace $model)
    {
        parent::__construct($model);
    }
}
