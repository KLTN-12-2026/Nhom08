<?php

namespace App\Http\Requests\WalletTransaction;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateWalletTransactionRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'wallet_id' => 'required|integer|exists:wallets,id',
            'type' => ['required', 'string', Rule::in(['earn', 'spend'])],
            'amount' => 'required|integer|min:1',
            'description' => 'nullable|string|max:255',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
        ];
    }
}
