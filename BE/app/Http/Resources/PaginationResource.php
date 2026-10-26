<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaginationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data'         => $this->items(),
            'current_page' => $this->currentPage(),
            'last_page'    => $this->lastPage(),
            'per_page'     => $this->perPage(),
            'total'        => $this->total(),
        ];
    }
}
