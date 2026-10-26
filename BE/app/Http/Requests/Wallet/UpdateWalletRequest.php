<?php

namespace App\Http\Requests\Wallet;

use App\Http\Requests\BaseRequest;

class UpdateWalletRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'points' => 'nullable|integer|min:0',
            'level' => 'nullable|integer|min:1',
            'total_earned' => 'nullable|integer|min:0',
            'total_spent' => 'nullable|integer|min:0',
        ];
    }
}
