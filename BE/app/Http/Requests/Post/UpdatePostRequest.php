<?php

namespace App\Http\Requests\Post;

use App\Http\Requests\BaseRequest;

class UpdatePostRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'content' => 'nullable|string|max:2000',
            'place_id' => 'nullable|exists:places,id',
        ];
    }
}
