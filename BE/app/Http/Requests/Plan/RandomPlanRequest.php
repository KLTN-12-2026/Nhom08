<?php

namespace App\Http\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;

class RandomPlanRequest extends \App\Http\Requests\BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'budget' => 'required|numeric|min:50000|max:10000000',
            'activity_groups' => 'required|array|min:1',
            'activity_groups.*' => 'integer|exists:activity_groups,id',
            'filters' => 'sometimes|array',
            'filters.style' => 'sometimes|string|in:romantic,casual,trendy,family,budget,premium',
            'filters.distance_km' => 'sometimes|numeric|min:1|max:50',
            'filters.latitude' => 'required_with:filters.longitude|numeric',
            'filters.longitude' => 'required_with:filters.latitude|numeric',
            'save_plan' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'budget.required' => 'Budget is required',
            'budget.min' => 'Budget must be at least 50,000₫',
            'budget.max' => 'Budget cannot exceed 10,000,000₫',
            'activity_groups.required' => 'Please select at least one activity group',
            'activity_groups.min' => 'Please select at least one activity group',
            'activity_groups.*.exists' => 'Selected activity group does not exist',
            'filters.style.in' => 'Invalid style. Allowed: romantic, casual, trendy, family, budget, premium',
        ];
    }
}