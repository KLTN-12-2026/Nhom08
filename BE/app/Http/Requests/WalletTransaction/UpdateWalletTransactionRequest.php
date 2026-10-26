<?php

namespace App\Http\Requests\WalletTransaction;

use App\Http\Requests\BaseRequest;

class UpdateWalletTransactionRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'description' => 'nullable|string|max:255',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
        ];
    }
}
