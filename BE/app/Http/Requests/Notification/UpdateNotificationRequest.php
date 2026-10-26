<?php

namespace App\Http\Requests\Notification;

use App\Http\Requests\BaseRequest;

class UpdateNotificationRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:1000',
            'type' => 'nullable|string|max:50',
            'data' => 'nullable|array',
            'is_read' => 'nullable|boolean',
            'expires_at' => 'nullable|date|after:now',
        ];
    }
}
