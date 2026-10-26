<?php

namespace App\Http\Resources\PlaceReaction;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceReactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'place_id' => $this->place_id,
            'reaction_type' => $this->reaction_type?->value,
            'reaction_label' => $this->reaction_type?->label(),
            'reaction_icon' => $this->reaction_type?->icon(),
            'reaction_color' => $this->reaction_type?->color(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
