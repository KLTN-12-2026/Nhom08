<?php

namespace App\Http\Resources\Quote;

use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'type' => $this->type,
            'category' => $this->category,
            'language' => $this->language,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata,
            'usage_count' => $this->usage_count,
            'last_used_at' => $this->last_used_at ? $this->last_used_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
