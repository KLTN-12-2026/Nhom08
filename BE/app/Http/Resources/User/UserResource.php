<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get places view limit
        $userService = app(\App\Services\UserService::class);
        $placesLimit = $userService->getPlacesViewLimit($this->resource);
        
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "gender" => $this->gender,
            "date_of_birth" => $this->date_of_birth,
            "phone_number" => $this->phone_number,
            "address" => $this->address,
            "role" => $this->role,
            "avatar" => $this->avatar,
            "is_active" => $this->is_active,
            "is_blocked" => $this->is_blocked,
            "wallet" => $this->whenLoaded('wallet', function () {
                return [
                    "points" => $this->wallet->points ?? 0,
                    "level" => $this->wallet->level ?? 1,
                    "total_earned" => $this->wallet->total_earned ?? 0,
                    "total_spent" => $this->wallet->total_spent ?? 0,
                ];
            }, null),
            "is_limit" => $placesLimit !== null, // true nếu có limit, false nếu unlimited
            "places_limit" => $placesLimit, // số limit hoặc null (unlimited)
            
            // Premium subscription info
            "is_premium" => $this->isPremium(),
            "premium_until" => $this->premium_until?->toIso8601String(),
            "days_remaining" => $this->daysUntilExpiry(),
            
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
        ];
    }
}
