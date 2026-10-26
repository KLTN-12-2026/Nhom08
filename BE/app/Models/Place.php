<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Place extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'description',
        'average_price',
        'rating',
        'status',
        'contact_email',
        'contact_phone',
        'admin_notes',
        'is_anonymous',
        'tag_ids',
    ];

    public function activityGroups()
    {
        return $this->belongsToMany(ActivityGroup::class, 'activity_group_place')
            ->withTimestamps();
    }

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'average_price' => 'float',
        'rating' => 'float',
        'is_anonymous' => 'boolean',
        'tag_ids' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function favoritePlaces()
    {
        return $this->hasMany(FavoritePlace::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class);
    }

    public function plans()
    {
        return $this->belongsToMany(Plan::class);
    }

    public function reactions()
    {
        return $this->hasMany(PlaceReaction::class);
    }

    // Helper method để lấy tags từ tag_ids
    public function getTagsAttribute()
    {
        if (empty($this->tag_ids)) {
            return collect([]);
        }
        return Tag::whereIn('id', $this->tag_ids)->get();
    }

    /**
     * Check if this place is favorited by a specific user
     */
    public function isFavoritedBy($userId)
    {
        if (!$userId) {
            return false;
        }
        return $this->favoritePlaces()->where('user_id', $userId)->exists();
    }

    /**
     * Get average rating from reviews
     * This will use the loaded reviews_avg_rating if available, otherwise query
     */
    public function getAverageRatingAttribute()
    {
        // If reviews_avg_rating is loaded via withAvg, use it
        if (isset($this->attributes['reviews_avg_rating'])) {
            return (float) $this->attributes['reviews_avg_rating'] ?? 0;
        }
        // Otherwise, query directly
        return (float) ($this->reviews()->avg('rating') ?? 0);
    }

    /**
     * Get total reviews count
     * This will use the loaded reviews_count if available, otherwise query
     */
    public function getReviewsCountAttribute()
    {
        // If reviews_count is loaded via withCount, use it
        if (isset($this->attributes['reviews_count'])) {
            return (int) $this->attributes['reviews_count'];
        }
        // Otherwise, query directly
        return $this->reviews()->count();
    }

    /**
     * Get total reactions count
     * This will use the loaded reactions_count if available, otherwise query
     */
    public function getTotalReactionAttribute()
    {
        // If reactions_count is loaded via withCount, use it
        if (isset($this->attributes['reactions_count'])) {
            return (int) $this->attributes['reactions_count'];
        }
        // Otherwise, query directly
        return $this->reactions()->count();
    }

}