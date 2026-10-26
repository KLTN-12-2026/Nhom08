<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends BaseRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'min:2',
                'max:100',
            ],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($this->route('user')),
            ],
            'phone_number' => [
                'nullable',
                'string',
                'max:20',
            ],
            'role' => [
                'sometimes',
                'string',
                Rule::in(['admin', 'user']),
            ],
            'gender' => [
                'nullable',
                'string',
                Rule::in(['male', 'female', 'other']),
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
            'is_blocked' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.min' => 'Name must be at least 2 characters.',
            'name.max' => 'Name must not exceed 100 characters.',
            
            'phone_number.max' => 'Phone number must not exceed 20 characters.',
            
            'role.in' => 'Role must be either admin or user.',
            
            'gender.in' => 'Gender must be male, female, or other.',
            
            'is_active.boolean' => 'Active status must be true or false.',
            'is_blocked.boolean' => 'Blocked status must be true or false.',
        ];
    }
}
