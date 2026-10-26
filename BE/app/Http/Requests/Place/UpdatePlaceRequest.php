<?php

namespace App\Http\Requests\Place;

use App\Http\Requests\BaseRequest;

class UpdatePlaceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
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
            
            // Media management (unified approach)
            // Send ALL image URLs (both existing and new) - backend will sync automatically
            'image_urls' => 'nullable|array|max:10',
            'image_urls.*' => 'url|max:2048',
            
            // Raw image files from client
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',

            'activity_group_ids' => 'nullable|array',
            'activity_group_ids.*' => 'integer|exists:activity_groups,id',
        ];
    }
}
