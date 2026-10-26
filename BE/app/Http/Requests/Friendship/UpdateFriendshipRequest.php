<?php

namespace App\Http\Requests\Friendship;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateFriendshipRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in(['pending', 'accepted', 'rejected'])],
        ];
    }
}
