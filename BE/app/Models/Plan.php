<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'budget',
        'total_estimated',
        'activities',      // ['food', 'drink', 'activity']
        'places',          // [1, 4, 9] - Array of place IDs
        'filters',         // {style: 'romantic', distance_km: 5}
        'is_saved',
        'actual_cost',
        'scheduled_at',
    ];

    protected $casts = [
        'activities' => 'array',
        'places' => 'array',
        'filters' => 'array',
        'budget' => 'float',
        'total_estimated' => 'float',
        'actual_cost' => 'float',
        'is_saved' => 'boolean',
        'scheduled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the plan
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get place details for this plan
     */
    public function getPlaceDetailsAttribute()
    {
        if (!is_array($this->places)) {
            return collect();
        }
        
        return Place::whereIn('id', $this->places)
            ->with(['media', 'categories:id,name,display_name'])
            ->get();
    }

    /**
     * Get place count
     */
    public function getPlaceCountAttribute()
    {
        return is_array($this->places) ? count($this->places) : 0;
    }

    /**
     * Check if plan is within budget
     */
    public function getIsWithinBudgetAttribute()
    {
        return $this->total_estimated <= $this->budget;
    }

    /**
     * Get budget efficiency (percentage used)
     */
    public function getBudgetEfficiencyAttribute()
    {
        if ($this->budget == 0) return 0;
        return ($this->total_estimated / $this->budget) * 100;
    }
}