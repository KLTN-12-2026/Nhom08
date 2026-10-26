<?php

namespace App\Http\Resources\Announcement;

use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'position' => $this->position,
            'status' => $this->status,
            'priority' => $this->priority,
            'start_at' => $this->start_at ? $this->start_at->toISOString() : null,
            'end_at' => $this->end_at ? $this->end_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}

