<?php

namespace App\Http\Resources\Review;

use App\Http\Resources\Media\MediaResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'username' => $this->user->username,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
                ];
            }),
            'rating' => $this->rating,
            'comment' => $this->comment,
            'media' => $this->whenLoaded('media', function () {
                return MediaResource::collection($this->media);
            }, []),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
