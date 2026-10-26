<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;

class StoreActivityGroupRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => 'required|string|max:100|alpha_dash|unique:activity_groups,key',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'categories' => 'nullable|array',
            'categories.*.category_id' => 'required|integer|exists:categories,id',
            'categories.*.subtype_name' => 'nullable|string|max:255',
            'categories.*.display_order' => 'nullable|integer|min:0',
        ];
    }
}


