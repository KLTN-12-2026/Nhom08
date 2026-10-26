<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'activity_group_category')
            ->withPivot(['subtype_name', 'display_order'])
            ->withTimestamps()
            ->orderByPivot('display_order');
    }

    public function places()
    {
        return $this->belongsToMany(Place::class, 'activity_group_place')
            ->withTimestamps();
    }
}


