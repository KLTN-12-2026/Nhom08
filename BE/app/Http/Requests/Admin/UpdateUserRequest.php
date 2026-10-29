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
            'name.min' => 'Họ tên phải có ít nhất 2 ký tự.',
            'name.max' => 'Họ tên không được vượt quá 100 ký tự.',

            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email này đã được sử dụng.',

            'phone_number.max' => 'Số điện thoại không được vượt quá 20 ký tự.',

            'role.in' => 'Vai trò phải là admin hoặc user.',

            'gender.in' => 'Giới tính phải là male, female hoặc other.',

            'is_active.boolean' => 'Trạng thái hoạt động phải là true hoặc false.',
            'is_blocked.boolean' => 'Trạng thái chặn phải là true hoặc false.',
        ];
    }
}
