<?php

namespace App\Http\Requests\FavoritePlace;

use App\Http\Requests\BaseRequest;

class CreateFavoritePlaceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'place_id' => 'required|exists:places,id',
        ];
    }
}
