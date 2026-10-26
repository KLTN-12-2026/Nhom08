<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;

class SyncActivityGroupCategoriesRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categories' => 'nullable|array',
            'categories.*.category_id' => 'required|integer|exists:categories,id',
            'categories.*.subtype_name' => 'nullable|string|max:255',
            'categories.*.display_order' => 'nullable|integer|min:0',
        ];
    }
}


