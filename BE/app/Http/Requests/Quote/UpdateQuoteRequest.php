<?php

namespace App\Http\Requests\Quote;

use App\Http\Requests\BaseRequest;

class UpdateQuoteRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|string|max:255',
            'category' => 'sometimes|nullable|string',
            'language' => 'sometimes|required|string',
            'priority' => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|nullable|boolean',
            'metadata' => 'sometimes|nullable|array',
        ];
    }
}
?>
