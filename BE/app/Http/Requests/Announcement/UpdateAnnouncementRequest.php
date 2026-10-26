<?php

namespace App\Http\Requests\Announcement;

use App\Http\Requests\BaseRequest;

class UpdateAnnouncementRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:banner,popup,text',
            'position' => 'sometimes|required|string|in:home',
            'status' => 'sometimes|required|string|in:active,inactive',
            'priority' => 'nullable|integer|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
        ];
    }
}
