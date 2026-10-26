<?php

namespace App\Http\Requests\Category;

use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:100|unique:categories,name,' . $this->route('category')->id,
            'display_name' => 'nullable|string|max:200',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ];
    }
}