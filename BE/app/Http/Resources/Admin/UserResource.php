<?php

namespace App\Http\Resources\Admin;

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
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'name' => $this->name,
            'phone_number' => $this->phone_number,
            'role' => $this->role,
            'gender' => $this->gender,
            'is_active' => $this->is_active,
            'is_blocked' => $this->is_blocked,
            'avatar' => $this->avatar,
            
            // Premium subscription info
            'is_premium' => $this->isPremium(),
            'premium_until' => $this->premium_until?->toIso8601String(),
            'days_remaining' => $this->daysUntilExpiry(),
            'revenuecat_customer_id' => $this->revenuecat_customer_id,
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            
            // Additional admin-specific data
            'wallet' => $this->whenLoaded('wallet', function () {
                return [
                    'id' => $this->wallet->id,
                    'points' => $this->wallet->points,
                    'level' => $this->wallet->level,
                    'total_earned' => $this->wallet->total_earned,
                    'total_spent' => $this->wallet->total_spent,
                    'created_at' => $this->wallet->created_at,
                    'updated_at' => $this->wallet->updated_at,
                ];
            }),
            
            'stats' => [
                'places_count' => $this->whenLoaded('places', function () {
                    return $this->places->count();
                }),
                'reviews_count' => $this->whenLoaded('reviews', function () {
                    return $this->reviews->count();
                }),
                'posts_count' => $this->whenLoaded('posts', function () {
                    return $this->posts->count();
                }),
                'friends_count' => $this->whenLoaded('sentFriendships', function () {
                    return $this->sentFriendships->where('status', 'accepted')->count() +
                           $this->receivedFriendships->where('status', 'accepted')->count();
                }),
            ],
        ];
    }
}
