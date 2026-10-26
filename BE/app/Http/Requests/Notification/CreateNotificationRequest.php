<?php

namespace App\Http\Requests\Notification;

use App\Http\Requests\BaseRequest;

class CreateNotificationRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|string|max:50',
            'data' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
        ];
    }
}
