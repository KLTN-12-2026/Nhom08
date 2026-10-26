<?php

namespace App\Http\Requests\Admin\Notification;

use App\Http\Requests\BaseRequest;

class SendToUsersNotificationRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|string|max:50',
            'data' => 'nullable|array',
            'push' => 'nullable|boolean',
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
            'user_ids.required' => 'User IDs array is required.',
            'user_ids.array' => 'User IDs must be an array.',
            'user_ids.min' => 'At least one user ID is required.',
            'user_ids.*.required' => 'Each user ID is required.',
            'user_ids.*.integer' => 'Each user ID must be an integer.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
            'title.required' => 'Title is required.',
            'title.string' => 'Title must be a string.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'message.required' => 'Message is required.',
            'message.string' => 'Message must be a string.',
            'message.max' => 'Message may not be greater than 1000 characters.',
            'type.string' => 'Type must be a string.',
            'type.max' => 'Type may not be greater than 50 characters.',
            'data.array' => 'Data must be an array.',
            'push.boolean' => 'Push must be a boolean value.',
        ];
    }
}

