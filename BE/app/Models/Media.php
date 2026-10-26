<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'url',
        'size',
        'file_name',
        'width',
        'height',
        'format',
        'user_id',
        'post_id',
        'place_id',
        'review_id',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}
