<?php

namespace App\Http\Resources\Place;

use App\Http\Resources\Review\ReviewResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get authenticated user ID if available
        $userId = $request->user()?->id;
        
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'description' => $this->description,
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'display_name' => $category->display_name,
                    ];
                });
            }),
            'activity_groups' => $this->whenLoaded('activityGroups', function () {
                return $this->activityGroups->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'key' => $group->key,
                        'name' => $group->name,
                    ];
                });
            }),
            'average_price' => $this->average_price,
            'rating' => $this->rating,
            'average_rating' => round($this->average_rating, 2),
            'reviews_count' => $this->reviews_count,
            'total_reaction' => $this->total_reaction,
            'status' => $this->status,


            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'admin_notes' => $this->admin_notes,
            'is_anonymous' => $this->is_anonymous,
            'is_favorited' => $this->isFavoritedBy($userId),
            'tags' => $this->tags->pluck('name')->toArray(),
            'media' => $this->whenLoaded('media', function () use ($request) {
                // For detail view (show route), return all media
                // For list view (index route), return only first media to reduce payload
                $mediaCollection = $request->routeIs('*.show') 
                    ? $this->media 
                    : $this->media->take(1);
                
                return $mediaCollection->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'url' => $media->url,
                    ];
                });
            }, []),
            'user' => $this->whenLoaded('user', function () {
                return new UserResource($this->user);
            }),
            'reviews' => $this->whenLoaded('reviews', function () {
                return ReviewResource::collection($this->reviews);
            }, []),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
