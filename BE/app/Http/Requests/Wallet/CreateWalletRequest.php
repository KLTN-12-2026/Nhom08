<?php

namespace App\Http\Requests\Wallet;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateWalletRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id|unique:wallets,user_id',
            'points' => 'nullable|integer|min:0',
            'level' => 'nullable|integer|min:1',
            'total_earned' => 'nullable|integer|min:0',
            'total_spent' => 'nullable|integer|min:0',
        ];
    }
}
