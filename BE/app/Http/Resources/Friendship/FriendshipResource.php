<?php

namespace App\Http\Resources\Friendship;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FriendshipResource extends JsonResource
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
            'friend_id' => $this->friend_id,
            'friend' => $this->whenLoaded('friend', function () {
                return [
                    'id' => $this->friend->id,
                    'username' => $this->friend->username,
                    'name' => $this->friend->name,
                    'avatar' => $this->friend->avatar,
                ];
            }),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
