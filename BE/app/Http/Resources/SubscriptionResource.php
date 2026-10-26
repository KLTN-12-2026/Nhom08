<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Subscription Resource (User-facing)
 * 
 * Format subscription data cho user APIs
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
            'product_id' => $this->product_id,
            'product_name' => $this->getProductName(),
            'status' => $this->status,
            'platform' => $this->platform,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'days_remaining' => $this->daysRemaining(),
            'is_active' => $this->isActive(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
