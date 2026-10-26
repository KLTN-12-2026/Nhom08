<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchFilterRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'query'      => 'nullable|string|max:255',
            'filters'    => 'nullable|array',
            'sort_by'    => 'nullable|string|max:50',
            'sort_order' => 'nullable|in:asc,desc',
            'per_page'   => 'nullable|integer|min:1|max:100',
            'page'       => 'nullable|integer|min:1',
            'price_min'  => 'nullable|numeric|min:0',
            'price_max'  => 'nullable|numeric|min:0',
            'latitude'   => 'nullable|numeric|between:-90,90',
            'longitude'  => 'nullable|numeric|between:-180,180',
            'distance_km'=> 'nullable|numeric|min:0',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
        ];
    }

    public function filters(): array
    {
        $filters = $this->input('filters', []);
        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== [];
        });

        return [
            'query' => $this->input('query', ''),
            'filters' => $filters,
            'price_min' => $this->input('price_min'),
            'price_max' => $this->input('price_max'),
            'latitude' => $this->input('latitude'),
            'longitude' => $this->input('longitude'),
            'distance_km' => $this->input('distance_km'),
            'category_ids' => $this->input('category_ids', []),
            'tag_ids' => $this->input('tag_ids', []),
            'tags' => $this->input('tags', []),
        ];
    }

    public function sort(): array
    {
        return [
            'sort_by' => $this->input('sort_by', 'id'),
            'sort_order' => $this->input('sort_order', 'desc'),
        ];
    }

    public function pagination(): array
    {
        return [
            'page'     => $this->input('page'),
            'per_page' => $this->input('per_page'),
        ];
    }
}
