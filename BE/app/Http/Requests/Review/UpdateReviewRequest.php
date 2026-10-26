<?php

namespace App\Http\Requests\Review;

use App\Http\Requests\BaseRequest;

class UpdateReviewRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'rating' => 'nullable|numeric|between:1,5',
            'comment' => 'nullable|string|max:1000',
            'media_ids' => 'nullable|array',
            'media_ids.*' => 'integer|exists:media,id',
            
            // Image URLs from client (uploaded directly to Cloudinary)
            'image_urls' => 'nullable|array|max:10',
            'image_urls.*' => 'url|max:2048',
        ];
    }
}
