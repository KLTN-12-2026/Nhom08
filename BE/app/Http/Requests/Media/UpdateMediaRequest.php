<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\BaseRequest;

class UpdateMediaRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'url' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
            'size' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'format' => 'nullable|string|max:10',
        ];
    }
}
