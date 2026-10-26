<?php

namespace App\Http\Requests\Quote;

use App\Enums\QuoteTypeEnum;
use App\Http\Requests\BaseRequest;

class CreateQuoteRequest extends BaseRequest
{
    public function rules(): array
    {
        $validTypes = implode(',', QuoteTypeEnum::values());

        return [
            'content'  => 'required|string',
            'type'     => 'required|string|in:' . $validTypes,
            'category' => 'nullable|string',
            'language' => 'required|string',
            'priority' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ];
    }
}
