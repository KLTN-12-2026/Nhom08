<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Premium Status Resource
 * 
 * Wrapper resource cho premium status response
 * Bao gồm is_premium flag và subscription details
 */
class PremiumStatusResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this->resource là user object
        $subscription = $this->subscriptions()
            ->where('status', 'active')
            ->latest()
            ->first();

        return [
            'is_premium' => $this->isPremium(),
            'tier' => $this->subscription_tier, // Trả về 'free', 'pro', hoặc 'enterprise'
            'subscription' => $subscription ? new SubscriptionResource($subscription) : null,
        ];
    }
}
