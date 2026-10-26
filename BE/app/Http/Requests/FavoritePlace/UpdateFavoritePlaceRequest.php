<?php

namespace App\Http\Requests\FavoritePlace;

use App\Http\Requests\BaseRequest;

class UpdateFavoritePlaceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'place_id' => 'nullable|exists:places,id',
        ];
    }
}
