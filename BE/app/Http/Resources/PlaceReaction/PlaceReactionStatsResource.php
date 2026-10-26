<?php

namespace App\Http\Resources\PlaceReaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceReactionStatsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'place_id' => $this->resource['place_id'] ?? null,
            'total_reactions' => $this->resource['total_reactions'] ?? 0,
            'bad_count' => $this->resource['bad_count'] ?? 0,
            'normal_count' => $this->resource['normal_count'] ?? 0,
            'good_count' => $this->resource['good_count'] ?? 0,
            'bad_percentage' => $this->resource['bad_percentage'] ?? 0,
            'normal_percentage' => $this->resource['normal_percentage'] ?? 0,
            'good_percentage' => $this->resource['good_percentage'] ?? 0,
            'my_reaction' => $this->resource['my_reaction'] ?? null,
        ];
    }
}
