<?php

namespace App\Http\Requests\Category;

use App\Http\Requests\BaseRequest;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class CreateCategoryRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Check via CategoryPolicy if user can create categories
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Category::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:categories,name',
            'display_name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ];
    }
}