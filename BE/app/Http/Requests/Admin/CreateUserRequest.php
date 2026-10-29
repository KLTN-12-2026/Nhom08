<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateUserRequest extends BaseRequest
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
            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'password_confirmation' => [
                'required',
                'string',
                'min:8',
            ],
            'name' => [
                'required',
                'string',
                'min:2',
                'max:200',
            ],
            'phone_number' => [
                'nullable',
                'string',
                'max:20',
            ],
            'role' => [
                'required',
                'string',
                Rule::in(['admin', 'user']),
            ],
            'gender' => [
                'nullable',
                'string',
                Rule::in(['male', 'female', 'other']),
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
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email này đã được đăng ký.',

            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp.',

            'password_confirmation.required' => 'Vui lòng xác nhận mật khẩu.',
            'password_confirmation.min' => 'Mật khẩu xác nhận phải có ít nhất 8 ký tự.',

            'name.required' => 'Vui lòng nhập họ tên.',
            'name.min' => 'Họ tên phải có ít nhất 2 ký tự.',
            'name.max' => 'Họ tên không được vượt quá 200 ký tự.',

            'phone_number.max' => 'Số điện thoại không được vượt quá 20 ký tự.',

            'role.required' => 'Vui lòng chọn vai trò.',
            'role.in' => 'Vai trò phải là admin hoặc user.',

            'gender.in' => 'Giới tính phải là male, female hoặc other.',
        ];
    }
}
