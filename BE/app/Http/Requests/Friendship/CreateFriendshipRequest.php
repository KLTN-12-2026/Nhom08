<?php

namespace App\Http\Requests\Friendship;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateFriendshipRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'friend_id' => 'required|exists:users,id|different:user_id',
            'status' => ['nullable', 'string', Rule::in(['pending', 'accepted', 'rejected'])],
        ];
    }
}
