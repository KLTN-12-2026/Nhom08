<?php

namespace App\Http\Resources\Post;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'username' => $this->user->username,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
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
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
