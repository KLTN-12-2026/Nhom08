<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\BaseRequest;

class CreateMediaRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'url' => 'required|string|max:500',
            'file_name' => 'required|string|max:255',
            'size' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'format' => 'nullable|string|max:10',
            'user_id' => 'nullable|exists:users,id',
            'post_id' => 'nullable|exists:posts,id',
            'place_id' => 'nullable|exists:places,id',
            'review_id' => 'nullable|exists:reviews,id',
        ];
    }
}
