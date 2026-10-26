<?php

namespace App\Http\Requests\Post;

use App\Http\Requests\BaseRequest;

class CreatePostRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:2000',
            'place_id' => 'nullable|exists:places,id',
        ];
    }
}
