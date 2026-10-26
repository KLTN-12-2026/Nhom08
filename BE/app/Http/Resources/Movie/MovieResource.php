<?php

namespace App\Http\Resources\Movie;

use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'moveek_id' => $this->moveek_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'poster' => $this->poster,
            'release_date' => $this->release_date,
            'rating' => $this->rating,
            'genres' => $this->genres,
            'language' => $this->language,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
