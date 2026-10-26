<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin Subscription Resource
 * 
 * API Resource cho admin để xem subscription details
 */
class SubscriptionResource extends JsonResource
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
            'user_id' => $this->user_id,
            'revenuecat_customer_id' => $this->revenuecat_customer_id,
            'product_id' => $this->product_id,
            'product_name' => $this->getProductName(),
            'status' => $this->status,
            'platform' => $this->platform,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'days_remaining' => $this->daysRemaining(),
            'is_active' => $this->isActive(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            
            // User information (when loaded)
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'username' => $this->user->username,
                    'email' => $this->user->email,
                    'name' => $this->user->name,
                    'avatar' => $this->user->avatar,
                    'is_premium' => $this->user->isPremium(),
                ];
            }),
        ];
    }
}
