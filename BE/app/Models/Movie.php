<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movie extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'moveek_id',
        'title',
        'slug',
        'poster',
        'release_date',
        'rating',
        'genres',
        'language',
        'description',
        'is_active',
    ];

    protected $casts = [
        'genres' => 'array',
        'is_active' => 'boolean',
    ];
}
