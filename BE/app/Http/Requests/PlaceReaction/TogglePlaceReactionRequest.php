<?php

namespace App\Http\Requests\PlaceReaction;

use App\Http\Requests\BaseRequest;
use App\Enums\ReactionType;
use Illuminate\Validation\Rules\Enum;

class TogglePlaceReactionRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'reaction_type' => ['required', 'integer', 'in:0,1,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'reaction_type.required' => 'Reaction type is required',
            'reaction_type.integer' => 'Reaction type must be an integer',
            'reaction_type.in' => 'Reaction type must be 0 (Bad), 1 (Normal), or 2 (Good)',
        ];
    }
}
