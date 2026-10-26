<?php

namespace App\Http\Resources\Media;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'size' => $this->size,
            'file_name' => $this->file_name,
            'width' => $this->width,
            'height' => $this->height,
            'format' => $this->format,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'username' => $this->user->username,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
                ];
            }),
            'post_id' => $this->post_id,
            'post' => $this->whenLoaded('post', function () {
                return [
                    'id' => $this->post->id,
                    'content' => $this->post->content,
                ];
            }),
            'place_id' => $this->place_id,
            'place' => $this->whenLoaded('place', function () {
                return [
                    'id' => $this->place->id,
                    'name' => $this->place->name,
                    'address' => $this->place->address,
                ];
            }),
            'review_id' => $this->review_id,
            'review' => $this->whenLoaded('review', function () {
                return [
                    'id' => $this->review->id,
                    'rating' => $this->review->rating,
                    'comment' => $this->review->comment,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
