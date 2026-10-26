<?php

namespace App\Http\Resources\Message;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender->id,
                    'username' => $this->sender->username,
                    'name' => $this->sender->name,
                    'avatar' => $this->sender->avatar,
                ];
            }),
            'receiver_id' => $this->receiver_id,
            'receiver' => $this->whenLoaded('receiver', function () {
                return [
                    'id' => $this->receiver->id,
                    'username' => $this->receiver->username,
                    'name' => $this->receiver->name,
                    'avatar' => $this->receiver->avatar,
                ];
            }),
            'content' => $this->content,
            'is_read' => $this->is_read,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
