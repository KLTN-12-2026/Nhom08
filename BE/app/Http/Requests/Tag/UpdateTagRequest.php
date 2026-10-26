<?php

namespace App\Http\Requests\Tag;

use App\Http\Requests\BaseRequest;

class UpdateTagRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tagId = $this->route('tag')?->id ?? $this->route('id');
        return [
            'name' => 'nullable|string|max:100|unique:tags,name,' . $tagId,
            'display' => 'nullable|boolean',
        ];
    }
}
