<?php

namespace App\Http\Requests\Message;

use App\Http\Requests\BaseRequest;

class CreateMessageRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'receiver_id' => 'required|exists:users,id|different:sender_id',
            'content' => 'required|string|max:1000',
        ];
    }
}
