<?php

namespace App\Http\Requests\DeviceToken;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateDeviceTokenRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'token' => 'required|string|max:255|unique:device_tokens,token',
            'platform' => ['nullable', 'string', Rule::in(['ios', 'android', 'web'])],
        ];
    }
}
