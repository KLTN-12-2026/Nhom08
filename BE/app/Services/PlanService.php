<?php

namespace App\Services;

use App\Repositories\PlanRepository;
use App\Models\Place;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

/**
 * FLOW 2: Service Layer - Business Logic
 * 
 * This service contains the core business logic for generating random plans.
 * It orchestrates the process of finding places, selecting them intelligently,
 * and personalizing recommendations.
 * 
 * Architecture Pattern: Service Layer Pattern
 * - Separates business logic from controllers (presentation layer)
 * - Uses Repository pattern for data access
 * - Makes code testable and maintainable
 */
class PlanService
{
    /**
     * Repository for database operations
     * Follows Repository Pattern - abstracts database queries
     */
    protected $planRepository;

    /**
     * Constructor: Dependency Injection
     * PlanService depends on PlanRepository to access database
     */
    public function __construct(PlanRepository $planRepository)
    {
        $this->planRepository = $planRepository;
    }

    /**
     * FLOW 2.1: Main Method - Generate Random Plan
     * 
     * This is the core method that orchestrates the entire plan generation process.
     * 
     * Process Flow:
     * 1. Get smart places from repository (filtered by budget, category, location)
     * 2. Calculate time-based budget allocation (adjust ratios based on time of day)
     * 3. Select one place per activity using weighted random selection
     * 4. Calculate total estimated cost
     * 5. Personalize recommendations if user is logged in
     * 6. Return complete plan data
     * 
     * @param int $budget - User's budget in VND (e.g., 600000)
     * @param array $activities - Activities user wants (e.g., ['food', 'drink'])
     * @param array $filters - Additional filters (e.g., ['style' => 'romantic', 'distance_km' => 5])
     * @param int|null $userId - User ID if logged in, null otherwise
     * @return array - Complete plan with selected places and metadata
     */
    public function generateRandomPlan($budget, Collection $activityGroups, $filters = [], $userId = null)
    {
        // STEP 1: Get Smart Places from Repository
        // Repository will:
        // - Resolve activities (food, drink, etc.) via activity_groups table
        // - Calculate budget allocation per activity
        // - Query places within budget range with price tolerance
        // - Filter by location if provided (distance-based search)
        // - Cache results for performance
        // Returns: ['food' => [Place1, Place2, ...], 'drink' => [Place3, Place4, ...]]
        $placesByCategory = $this->planRepository->getSmartPlaces(
            $budget,
            $activityGroups,
            $filters
        );

        // STEP 2: Calculate Time-Based Budget Allocation
        // Adjust budget ratios based on current time of day
        // Example: 7PM (dinner time) → food:60%, drink:30%, activity:10%
        // This helps recommend appropriate places for the time
        $timeOfDay = now()->hour; // Current hour (0-23)
        $adjustedRatios = $this->getTimeBasedAllocation($timeOfDay, $activityGroups->pluck('key')->all());
        // Note: Currently calculated but not used in selection - can be enhanced later

        // STEP 3: Select One Place Per Activity Using Weighted Random
        // For each activity category, select one place using weighted random selection
        // Weighted random means places with higher ratings/reviews have higher chance
        // This ensures quality while maintaining randomness
        $selectedPlaces = [];
        foreach ($placesByCategory as $activityKey => $places) {
            if ($places->count() > 0) {
                // Select one place using weighted random algorithm
                // Higher rated places with more reviews have higher probability
                $randomPlace = $this->weightedRandomSelection($places);
                $selectedPlaces[] = $randomPlace;
            }
        }

        // STEP 3.3: Limit to maximum 3 places
        // If user selected many activity groups, we only return top 3 places
        // Shuffle first to ensure variety, then take first 3
        if (count($selectedPlaces) > 3) {
            shuffle($selectedPlaces);
            $selectedPlaces = array_slice($selectedPlaces, 0, 3);
        }

        // STEP 3.5: Normalize prices - Fill default prices for places without pricing data
        // Some places don't have price info, so we assign symbolic prices
        $selectedPlaces = $this->normalizePlacePrices($selectedPlaces, $activityGroups);

        // STEP 4: Calculate Total Estimated Cost
        // Sum up average_price of all selected places
        // This gives user an estimate of total cost
        $totalEstimated = collect($selectedPlaces)->sum('average_price');

        // STEP 5: Personalize for Logged-In Users
        // If user is logged in, adjust recommendations based on:
        // - User's favorite categories (from favorite places)
        // - User's average budget (from previous plans)
        // This makes recommendations more relevant to the user
        if ($userId) {
            $selectedPlaces = $this->personalizeForUser($userId, $selectedPlaces, $activityGroups);
        }

        // STEP 5.5: Add Dating Tips if user selected 'date' activity group
        $dateTips = null;
        if ($activityGroups->contains('key', 'date')) {
            $dateTips = $this->getRandomDateTips();
        }

        // STEP 6: Return Complete Plan Data
        return [
            'selected_places' => $selectedPlaces,      // Array of Place models
            'total_estimated' => $totalEstimated,       // Total estimated cost
            'activity_groups' => $activityGroups,       // Original activity groups requested
            'allocated_budget' => $budget,              // Original budget
            'date_tips' => $dateTips,                   // Random dating tips (if date activity selected)
        ];
    }

    /**
     * FLOW 2.2: Time-Based Budget Allocation
     * 
     * Adjusts budget allocation ratios based on time of day.
     * Different times of day have different spending patterns:
     * - Dinner time (5PM-9PM): More budget for food
     * - Night out (9PM-2AM): More budget for drinks and activities
     * - Afternoon (12PM-5PM): Balanced between food and drinks
     * - Morning/Brunch (8AM-12PM): More budget for food and drinks
     * 
     * @param int $hour - Current hour (0-23)
     * @param array $activities - List of activities
     * @return array - Budget allocation ratios per activity
     * 
     * Example:
     * - 7PM (19:00) → ['food' => 0.6, 'drink' => 0.3, 'activity' => 0.1]
     *   Dinner time: prioritize food (60%), less activity (10%)
     * - 10PM (22:00) → ['food' => 0.3, 'drink' => 0.4, 'activity' => 0.3]
     *   Night out: prioritize drinks (40%) and activities (30%)
     */
    private function getTimeBasedAllocation($hour, $activities)
    {
        // THỜI ĐIỂM 1: Bữa tối (17:00 - 21:00)
        // VD: 7PM → Ưu tiên ăn uống, ít hoạt động
        if ($hour >= 17 && $hour <= 21) {
            return ['food' => 0.6, 'drink' => 0.3, 'activity' => 0.1];
            // → Budget 600k: food=360k, drink=180k, activity=60k
        }
        // THỜI ĐIỂM 2: Night out (21:00 - 02:00)
        // VD: 10PM → Đi bar, hoạt động giải trí
        elseif ($hour >= 21 || $hour <= 2) {
            return ['food' => 0.3, 'drink' => 0.4, 'activity' => 0.3];
            // → Budget 600k: food=180k, drink=240k, activity=180k
        }
        // THỜI ĐIỂM 3: Chiều (12:00 - 17:00)
        // VD: 2PM → Cafe + ăn nhẹ
        elseif ($hour >= 12 && $hour <= 17) {
            return ['food' => 0.4, 'drink' => 0.4, 'activity' => 0.2];
            // → Budget 600k: food=240k, drink=240k, activity=120k
        }
        // THỜI ĐIỂM 4: Sáng/Brunch (08:00 - 12:00)
        // VD: 10AM → Ăn sáng, cafe
        else {
            return ['food' => 0.6, 'drink' => 0.4];
            // → Budget 600k: food=360k, drink=240k
        }
    }

    /**
     * FLOW 2.3: Weighted Random Selection Algorithm
     * 
     * Selects a place randomly, but with higher probability for better places.
     * This ensures quality recommendations while maintaining randomness.
     * 
     * Algorithm:
     * 1. Calculate weight for each place based on:
     *    - Rating (0-5 stars → 0-100 points)
     *    - Review count (more reviews = more trust → up to 50 points)
     *    - Favorite count (popularity indicator → up to 100 points)
     * 2. Calculate total weight of all places
     * 3. Generate random number between 0 and total weight
     * 4. Find place whose cumulative weight includes the random number
     * 
     * This means:
     * - Place with rating 4.5, 50 reviews, 10 favorites → weight 135
     * - Place with rating 3.5, 10 reviews, 2 favorites → weight 79
     * - First place has 135/(135+79) = 63% chance of being selected
     * 
     * @param Collection $places - Collection of Place models to choose from
     * @return Place - Selected place (weighted random)
     */
    private function weightedRandomSelection($places)
    {
        // STEP 1: Calculate weight for each place
        $weights = $places->map(function ($place) {
            // Weight from rating: 0-5 stars → 0-100 points
            // Higher rating = higher weight
            $ratingWeight = $place->rating * 20;
            // Example: rating 4.5 → 90 points

            // Weight from review count: up to 50 points
            // More reviews = more trusted = higher weight
            $reviewWeight = min($place->review_count ?? 0, 100) * 0.5;
            // Example: 50 reviews → 25 points

            // Weight from favorite count: up to 100 points
            // More favorites = more popular = higher weight
            $favoriteWeight = min($place->favorite_count ?? 0, 50) * 2;
            // Example: 20 favorites → 40 points

            // Total weight for this place
            return $ratingWeight + $reviewWeight + $favoriteWeight;
        });

        // STEP 2: Calculate total weight
        $totalWeight = $weights->sum();
        if ($totalWeight == 0) {
            // If no weights, just return first place (fallback)
            return $places->first();
        }

        // STEP 3: Generate random number between 0 and total weight
        $random = mt_rand() / mt_getrandmax() * $totalWeight;
        // Example: totalWeight = 200, random = 150

        // STEP 4: Find place whose cumulative weight includes random number
        // This implements weighted random selection
        $cumulative = 0;
        foreach ($places as $index => $place) {
            $cumulative += $weights[$index]; // Add this place's weight
            // Example: Place 1 weight=80, cumulative=80
            // Example: Place 2 weight=120, cumulative=200
            if ($random <= $cumulative) {
                return $place; // This place is selected!
            }
        }

        // Fallback: return first place if something goes wrong
        return $places->first();
    }

    /**
     * FLOW 2.4: User Personalization
     * 
     * Personalizes recommendations based on user's history and preferences.
     * This makes recommendations more relevant to individual users.
     * 
     * Personalization Factors:
     * 1. Favorite Categories: If user has favorited places in certain categories,
     *    boost places from those categories
     * 2. Average Budget: User's historical spending patterns (future enhancement)
     * 
     * Process:
     * 1. Get user preferences from cache (cached for 24 hours for performance)
     * 2. Calculate match score for each place based on preferences
     * 3. Return places with updated match scores
     * 
     * @param int $userId - User ID
     * @param array $places - Current list of places
     * @param \Illuminate\Support\Collection $activityGroups - Selected activity groups
     * @return array - Places after personalization (with match_score added)
     * 
     * Example:
     * - User has favorited places in category_id 1 (Restaurants)
     * - Places in category 1 get +10 match_score boost
     * - This increases their chance of being recommended
     */
    private function personalizeForUser($userId, $places, $activities)
    {
        // STEP 1: Get user preferences from cache (24 hour cache)
        // Cache improves performance by avoiding repeated database queries
        $preferences = Cache::remember("user:{$userId}:preferences", 86400, function () use ($userId) {
            $user = \App\Models\User::find($userId);

            return [
                // Get categories from user's favorite places
                // Example: User favorited places in categories 1 and 5
                // Returns: [1, 5]
                'favorite_categories' => $user->favoritePlaces()
                    ->with('place.categories:id')
                    ->get()
                    ->flatMap(function ($favorite) {
                        return $favorite->place?->categories?->pluck('id') ?? collect();
                    })
                    ->unique()
                    ->values()
                    ->toArray(),

                // Calculate user's average budget from previous plans
                // Example: User's previous plans average 500,000 VND
                // This can be used to adjust recommendations (future enhancement)
                'average_budget' => \App\Models\Plan::where('user_id', $userId)
                    ->avg('total_estimated'),
            ];
        });

        // STEP 2: Boost match score for places matching user preferences
        // Convert array to collection for easier manipulation
        $placesCollection = collect($places);
        return $placesCollection->map(function ($place) use ($preferences) {
            $placeCategoryIds = [];

            if ($place->relationLoaded('categories') || method_exists($place, 'categories')) {
                $place->loadMissing('categories:id');
                $placeCategoryIds = $place->categories?->pluck('id')->all() ?? [];
            }

            if (empty($placeCategoryIds) && isset($place->category_id)) {
                $placeCategoryIds = [$place->category_id];
            }

            if (!empty(array_intersect($placeCategoryIds, $preferences['favorite_categories'] ?? []))) {
                $place->match_score = ($place->match_score ?? 0) + 10;
            }
            return $place;
        })->all();
    }

    /**
     * Normalize Place Prices - Fill Default Prices for Places Without Data
     * 
     * Many places don't have price information (average_price = null or 0).
     * This method assigns symbolic default prices based on activity group type
     * so budget calculations can work properly.
     * 
     * Default prices (in VND):
     * - Food (Ăn uống): 50,000 VND
     * - Drink (Đồ uống): 30,000 VND  
     * - Activity/Entertainment: 40,000 VND
     * - Other: 35,000 VND
     * 
     * @param array $places - Selected places
     * @param Collection $activityGroups - Activity groups
     * @return array - Places with normalized prices
     */
    private function normalizePlacePrices($places, $activityGroups)
    {
        // Map activity group keys to default prices (in full VND)
        $defaultPrices = [
            'food' => 50000,      // Ăn uống: 50,000 VND
            'drink' => 30000,     // Đồ uống: 30,000 VND
            'checkin' => 40000,   // Check-in/Giải trí: 40,000 VND
            'movie' => 80000,     // Xem phim: 40,000 VND
            'date' => 35000,      // Hẹn hò: 35,000 VND
        ];

        // Get activity group keys for quick lookup
        $activityKeys = $activityGroups->pluck('key')->toArray();

        return collect($places)->map(function ($place) use ($defaultPrices, $activityKeys) {
            // Check if place has no price or price = 0
            if (empty($place->average_price) || $place->average_price == 0) {
                // Try to get default price from first matching activity group
                $defaultPrice = 35000; // Fallback default (35,000 VND)

                foreach ($activityKeys as $key) {
                    if (isset($defaultPrices[$key])) {
                        $defaultPrice = $defaultPrices[$key];
                        break;
                    }
                }

                // Assign symbolic price
                $place->average_price = $defaultPrice;
            }

            return $place;
        })->all();
    }

    /**
     * Get Random Dating Tips
     * 
     * Returns 3 random tips from the tips.json file for dating/romantic plans.
     * These tips help users have better first-date experiences.
     * 
     * @return array|null - Array of 3 random tips, or null if file not found
     */
    private function getRandomDateTips()
    {
        $tipsFilePath = public_path('storage/tips.json');

        // Check if file exists
        if (!file_exists($tipsFilePath)) {
            return null;
        }

        try {
            // Read and decode JSON file
            $jsonContent = file_get_contents($tipsFilePath);
            $tipsData = json_decode($jsonContent, true);

            // Get all tips from the array
            if (!isset($tipsData['tips']) || !is_array($tipsData['tips'])) {
                return null;
            }

            $allTips = $tipsData['tips'];

            // Shuffle and get 3 random tips
            shuffle($allTips);
            $randomTips = array_slice($allTips, 0, 3);

            return $randomTips;
        } catch (\Exception $e) {
            // If any error occurs, return null
            return null;
        }
    }

    /**
     * Save plan to database
     * Lưu plan vào database
     * 
     * @param int $userId - ID user
     * @param int $budget - Ngân sách
     * @param array $activities - Activities
     * @param Collection $places - Places được chọn
     * @param int $totalEstimated - Tổng chi phí
     * @param array $filters - Filters
     * @return Plan - Plan đã được lưu
     * 
     * VÍ DỤ:
     * savePlan(1, 600000, ['food'], [Place1, Place2], 450000, ['style'=>'romantic'])
     * → Tạo Plan record với places=[1,2] (array của place IDs)
     */
    public function savePlan($userId, $budget, Collection $activityGroups, $places, $totalEstimated, $filters = [])
    {
        $activityGroupIds = $activityGroups->pluck('id')->all();

        $scheduledAt = $filters['date'] ?? null;
        unset($filters['date']);

        // Ensure places is a collection
        $placesCollection = $places instanceof Collection ? $places : collect($places);


        return $this->planRepository->createPlan([
            'user_id' => $userId, // VD: 1
            'budget' => $budget, // VD: 600000
            'total_estimated' => $totalEstimated, // VD: 450000
            'activities' => $activityGroupIds, // VD: [1, 2]
            'places' => $placesCollection->pluck('id')->toArray(), // VD: [1, 5, 9]
            'filters' => $filters, // VD: ['style'=>'romantic']
            'is_saved' => true, // Đánh dấu đã save
            'scheduled_at'   => $scheduledAt,
        ]);
    }

    /**
     * Get user's saved plans
     * Lấy danh sách plans đã save của user
     * 
     * @param int $userId - ID user
     * @param int $limit - Số lượng tối đa
     * @return Collection - Danh sách plans
     * 
     * VÍ DỤ:
     * getUserPlans(1, 10) 
     * → Trả về 10 plans gần nhất của user 1 (sort by created_at desc)
     */
    public function getUserPlans($userId, $limit = 10)
    {
        return $this->planRepository->getUserPlans($userId, $limit);
    }

    /**
     * Generate Advanced Plan (Premium Feature)
     * 
     * This method provides enhanced plan generation for premium users.
     * Differences from standard generation:
     * - More sophisticated algorithm
     * - Access to premium-only places
     * - Better personalization
     * 
     * @param array $data - Input data
     * @return array - Generated plan data
     */
    public function generateAdvanced(array $data)
    {
        // For now, we'll wrap the standard generation but add a 'premium' flag
        // In the future, this would use a different algorithm or AI model

        $budget = $data['budget'];
        $activityGroupIds = $data['activity_groups'];
        $filters = $data['filters'] ?? [];
        $userId = $data['user_id'] ?? null;

        // Get activity groups
        $activityGroups = \App\Models\ActivityGroup::whereIn('id', $activityGroupIds)->get();

        // Add premium filter
        $filters['premium_algorithm'] = true;

        // Use standard generation for now
        $result = $this->generateRandomPlan($budget, $activityGroups, $filters, $userId);

        // Add premium metadata
        $result['is_premium_generated'] = true;
        $result['ai_confidence_score'] = 0.95; // Example premium data

        return $result;
    }
}
