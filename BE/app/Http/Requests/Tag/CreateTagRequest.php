<?php

namespace App\Http\Requests\Tag;

use App\Http\Requests\BaseRequest;

class CreateTagRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:tags,name',
            'display' => 'nullable|boolean',
        ];
    }
}
