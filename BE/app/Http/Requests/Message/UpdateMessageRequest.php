<?php

namespace App\Http\Requests\Message;

use App\Http\Requests\BaseRequest;

class UpdateMessageRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'content' => 'nullable|string|max:1000',
            'is_read' => 'nullable|boolean',
        ];
    }
}
