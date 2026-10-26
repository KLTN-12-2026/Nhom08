<?php

namespace App\Http\Requests\Announcement;

use App\Http\Requests\BaseRequest;

class CreateAnnouncementRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:banner,popup,text',
            'position' => 'required|string|in:home',
            'status' => 'required|string|in:active,inactive',
            'priority' => 'nullable|integer|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
        ];
    }
}

