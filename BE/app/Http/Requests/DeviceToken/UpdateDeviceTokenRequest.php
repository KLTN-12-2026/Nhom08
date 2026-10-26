<?php

namespace App\Http\Requests\DeviceToken;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateDeviceTokenRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'token' => 'nullable|string|max:255|unique:device_tokens,token,' . $this->route('deviceToken')->id,
            'platform' => ['nullable', 'string', Rule::in(['ios', 'android', 'web'])],
            'is_active' => 'nullable|boolean',
        ];
    }
}
