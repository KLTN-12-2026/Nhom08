<?php

namespace App\Repositories;

use App\Models\Plan;
use App\Models\Place;
use App\Models\ActivityGroup;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class PlanRepository extends BaseRepository
{
    public function __construct(Plan $model)
    {
        parent::__construct($model);
    }

    /**
     * Get smart places based on budget and activities
     */
    public function getSmartPlaces($budget, $activityGroups, $filters = [])
    {
        if (!($activityGroups instanceof Collection)) {
            $activityGroups = collect($activityGroups);
        }

        $priceTolerance = config('planning.price_tolerance', 0.3);
        
        $results = [];
        
        $activityKeys = $activityGroups->pluck('key')->all();

        foreach ($activityGroups as $activityGroup) {
            $categoryIds = $this->getCategoryIdsForActivityGroup($activityGroup);
            if (empty($categoryIds)) {
                continue;
            }
            
            // Calculate price range
            $allocatedBudget = $this->calculateBudgetAllocation($budget, $activityGroup->key, $activityKeys);
            $minPrice = $allocatedBudget * (1 - $priceTolerance);
            $maxPrice = $allocatedBudget * (1 + $priceTolerance);
            
            // Cache key
            $cacheKey = sprintf(
                'places:activity:%s:categories:%s:budget:%s-%s',
                $activityGroup->id,
                implode('-', $categoryIds),
                $minPrice,
                $maxPrice
            );
            
            $ttl = config('planning.cache.ttl', 3600);
            $places = Cache::remember($cacheKey, $ttl, function() 
                use ($categoryIds, $minPrice, $maxPrice, $filters) {
                
                $query = Place::query()
                    ->whereHas('categories', function ($q) use ($categoryIds) {
                        $q->whereIn('categories.id', $categoryIds);
                    })
                    // Include places within budget OR places without price data (will be filled later)
                    ->where(function($q) use ($maxPrice) {
                        $q->where('average_price', '<=', $maxPrice)
                          ->orWhereNull('average_price')
                          ->orWhere('average_price', 0);
                    })
                    ->where('status', 1)
                    ->with(['categories:id,name,display_name', 'media']);
                
                // Location filter
                if (isset($filters['latitude']) && isset($filters['longitude'])) {
                    $lat = $filters['latitude'];
                    $lng = $filters['longitude'];
                    $radius = $filters['distance_km'] ?? 10;

                    $distanceExpression = '(
                        6371 * acos(
                            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                            sin(radians(?)) * sin(radians(latitude))
                        )
                    )';
                    
                    $query->select('places.*')
                        ->selectRaw("{$distanceExpression} AS distance", [$lat, $lng, $lat])
                        ->whereRaw("{$distanceExpression} < ?", [$lat, $lng, $lat, $radius])
                        ->orderBy('distance');
                }

                $query->withCount(['reviews as review_count', 'favoritePlaces as favorite_count']);
                
                return $query->orderBy('rating', 'desc')
                    ->orderBy('review_count', 'desc')
                    ->limit(50)
                    ->get();
            });
            
            if ($places->count() > 0) {
                $results[$activityGroup->key] = $places;
            }
        }
        
        return $results;
    }

    /**
     * Resolve all category IDs that belong to a specific activity group (e.g., food, drink).
     */
    protected function getCategoryIdsForActivityGroup(ActivityGroup $group): array
    {
        $ttl = config('planning.cache.ttl', 3600);
        $cacheKey = "activity-group:{$group->id}:category-ids";

        return Cache::remember($cacheKey, $ttl, function () use ($group) {
            $group->loadMissing('categories:id');

            return $group->categories
                ->pluck('id')
                ->unique()
                ->values()
                ->all();
        });
    }

    /**
     * Calculate budget allocation per activity
     */
    private function calculateBudgetAllocation($totalBudget, $activityKey, $activityKeys)
    {
        $ratios = config('planning.budget_allocation', [
            'food' => 0.5,
            'drink' => 0.3,
            'activity' => 0.2,
        ]);
        
        $totalRatio = 0;
        foreach ($activityKeys as $act) {
            $totalRatio += $ratios[$act] ?? 0;
        }
        
        $allocatedPerActivity = ($ratios[$activityKey] ?? 0) / max($totalRatio, 1);
        
        return $totalBudget * $allocatedPerActivity;
    }

    /**
     * Create a new plan
     */
    public function createPlan(array $data)
    {
        return $this->model->create($data);
    }

    /**
     * Get user's saved plans
     */
    public function getUserPlans($userId, $limit = 10)
    {
        return $this->model->where('user_id', $userId)
            ->where('is_saved', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}