<?php

namespace App\Http\Resources\Wallet;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
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
            'points' => $this->points,
            'level' => $this->level,
            'total_earned' => $this->total_earned,
            'total_spent' => $this->total_spent,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
