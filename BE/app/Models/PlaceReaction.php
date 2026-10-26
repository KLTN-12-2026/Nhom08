<?php

namespace App\Models;

use App\Enums\ReactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaceReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'place_id',
        'reaction_type',
    ];

    protected $casts = [
        'reaction_type' => ReactionType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
