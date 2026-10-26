<?php

namespace App\Http\Requests\Place;

use App\Http\Requests\BaseRequest;

class CreatePlaceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
            'average_price' => 'nullable|numeric|min:0',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'is_anonymous' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_comment' => 'nullable|string|max:1000',
            
            // Image URLs from client (uploaded directly to Cloudinary)
            'image_urls' => 'nullable|array|max:10',
            'image_urls.*' => 'url|max:2048',
            
            // Raw image files from client
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image

            'activity_group_ids' => 'nullable|array',
            'activity_group_ids.*' => 'integer|exists:activity_groups,id',
        ];
    }
}
