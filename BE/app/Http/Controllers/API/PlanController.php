<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Plan\RandomPlanRequest;
use App\Http\Resources\Place\PlaceResource;
use App\Http\Resources\Plan\PlanResource;
use App\Services\PlanService;
use App\Models\ActivityGroup;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    protected $service;
    
    /**
     * Constructor: Inject PlanService dependency
     * This follows Dependency Injection pattern - controller doesn't create service directly
     */
    public function __construct(PlanService $service)
    {
        $this->service = $service;
    }
    
    /**
     * FLOW 1: Entry Point - API Endpoint Handler

     * 
     * This is the entry point when client calls POST /api/plans
     * 
     * Request Flow:
     * 1. Request comes in → Laravel routes to this controller method
     * 2. RandomPlanRequest validates input (budget, activities, filters)
     * 3. Extract data from validated request
     * 4. Call PlanService to generate plan (business logic layer)
     * 5. Optionally save plan if user requested it
     * 6. Return JSON response with generated plan data
     * 
     * @OA\Post(
     *     path="/api/plans",
     *     tags={"Plans"},
     *     summary="Generate date plan",
     *     description="Generate a plan based on budget and activity groups with smart features",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"budget", "activity_groups"},
     *             @OA\Property(property="budget", type="number", example=600000),
     *             @OA\Property(property="activity_groups", type="array", @OA\Items(type="integer", example=1)),
     *             @OA\Property(property="filters", type="object",
     *                 @OA\Property(property="style", type="string", example="romantic"),
     *                 @OA\Property(property="distance_km", type="number", example=5),
     *                 @OA\Property(property="latitude", type="number", example=10.762622),
     *                 @OA\Property(property="longitude", type="number", example=106.660172)
     *             ),
     *             @OA\Property(property="save_plan", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plan generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Plan generated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function generate(RandomPlanRequest $request)
    {
        // STEP 1: Get authenticated user (can be null if not logged in)
        $user = $request->user();
        
        // STEP 1.5: Check if user can create more plans (policy check)
        if ($user && !$user->can('create', Plan::class)) {
            $planCount = Plan::where('user_id', $user->id)->count();
            return response()->json([
                'success' => false,
                'message' => 'Plan limit reached. Upgrade to Pro for unlimited plans.',
                'error_code' => 'PLAN_LIMIT_REACHED',
                'data' => [
                    'current_tier' => $user->subscription_tier,
                    'limit' => 5,
                    'current_count' => $planCount,
                    'upgrade_url' => '/api/subscriptions/upgrade'
                ]
            ], 403);
        }
        
        // STEP 2: Extract validated input from request
        // These values are already validated by RandomPlanRequest
        $budget = $request->input('budget');           // e.g., 600000 VND
        $activityGroupIds = $request->input('activity_groups'); // e.g., [1, 2]
        $filters = $request->input('filters', []);     // e.g., ['style' => 'romantic', 'distance_km' => 5]
        $savePlan = $request->input('save_plan', false); // Whether to save plan to database

        $activityGroups = ActivityGroup::query()
            ->whereIn('id', $activityGroupIds)
            ->where('is_active', true)
            ->get();

        if ($activityGroups->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Selected activity groups are not available.',
                'data' => null,
            ], 422);
        }
        
        // STEP 3: Delegate to Service Layer - This is where the main business logic happens
        // PlanService will handle:
        // - Finding suitable places based on budget and activities
        // - Time-based budget allocation
        // - Weighted random selection
        // - User personalization (if logged in)
        $result = $this->service->generateRandomPlan(
            $budget,
            $activityGroups,
            $filters,
            $user->id ?? null  // Pass user ID if logged in, null otherwise
        );
        
        // STEP 4: Extract results from service
        $selectedPlaces = $result['selected_places'];      // Array of Place models
        $totalEstimated = $result['total_estimated'];       // Total estimated cost
        
        // STEP 5: Optionally save plan to database if user requested it
        $plan = null;
        if ($savePlan && $user) {
            // Only save if user is authenticated and explicitly requested it
            $plan = $this->service->savePlan(
                $user->id,
                $budget,
                $activityGroups,
                collect($selectedPlaces),  // Convert array to Collection
                $totalEstimated,
                $filters
            );
        }
        
        // STEP 6: Return JSON response to client
        return response()->json([
            'success' => true,
            'message' => 'Plan generated successfully',
            'data' => [
                'budget_input' => $budget,              // Original budget user entered
                'total_estimated' => $totalEstimated,   // Actual estimated cost
                'activity_groups' => $activityGroups->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'key' => $group->key,
                        'name' => $group->name,
                    ];
                }),
                'places' => PlaceResource::collection($selectedPlaces), // Formatted place data with media
                'plan_id' => $plan?->id,                // Plan ID if saved, null otherwise
                'time_info' => [
                    'current_hour' => now()->hour,      // Current hour (0-23)
                    'recommended_time' => $this->getRecommendedTime(now()->hour), // 'morning', 'afternoon', etc.
                ],
                'date_tips' => $result['date_tips'] ?? null, // Random dating tips (if date activity selected)
            ],
        ]);
    }

    /**
     * Generate Advanced Plan (Premium)
     * 
     * @OA\Post(
     *     path="/api/plans/advanced",
     *     tags={"Plans"},
     *     summary="Generate advanced plan (Premium)",
     *     description="Generate a plan with advanced AI features (Pro/Enterprise only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"budget", "activity_groups"},
     *             @OA\Property(property="budget", type="number", example=1000000),
     *             @OA\Property(property="activity_groups", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="filters", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Advanced plan generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="is_premium", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=403, description="Premium subscription required")
     * )
     */
    public function advancedGenerate(RandomPlanRequest $request)
    {
        // Check policy
        $this->authorize('generateAdvanced', Plan::class);
        
        // Prepare data for service
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        
        // Call service
        $result = $this->service->generateAdvanced($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Advanced plan generated successfully',
            'data' => [
                'budget_input' => $result['allocated_budget'],
                'total_estimated' => $result['total_estimated'],
                'activity_groups' => $result['activity_groups']->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'key' => $group->key,
                        'name' => $group->name,
                    ];
                }),
                'places' => PlaceResource::collection($result['selected_places']),
                'is_premium' => true,
                'ai_confidence' => $result['ai_confidence_score']
            ]
        ]);
    }
    
    /**
     * Helper: Get recommended time label based on current hour
     * Used for display purposes in API response
     */
    private function getRecommendedTime($hour)
    {
        if ($hour >= 8 && $hour < 12) return 'morning';
        if ($hour >= 12 && $hour < 17) return 'afternoon';
        if ($hour >= 17 && $hour < 21) return 'dinner';
        return 'night';
    }
    
    /**
     * Get user's saved plans
     * 
     * @OA\Get(
     *     path="/api/plans/saved",
     *     tags={"Plans"},
     *     summary="Get saved plans",
     *     description="Get list of user's saved plans with pagination",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", example=20)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Saved plans retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Saved plans retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function saved(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);
        
        $plans = Plan::where('user_id', $user->id)
            ->where('is_saved', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Saved plans retrieved successfully',
            'data' => PlanResource::collection($plans),
            'meta' => [
                'current_page' => $plans->currentPage(),
                'last_page' => $plans->lastPage(),
                'per_page' => $plans->perPage(),
                'total' => $plans->total(),
            ],
        ]);
    }
    
    /**
     * Save a new plan from preview data
     * 
     * @OA\Post(
     *     path="/api/plans/save",
     *     tags={"Plans"},
     *     summary="Save a new plan from preview",
     *     description="Save plan data that was generated but not saved initially",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"budget", "activity_groups", "place_ids", "total_estimated"},
     *             @OA\Property(property="budget", type="number", example=600000),
     *             @OA\Property(property="activity_groups", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="place_ids", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="total_estimated", type="number", example=450000),
     *             @OA\Property(property="filters", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plan saved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Plan saved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function saveNewPlan(Request $request)
    {
        $user = $request->user();
        
        // Validate input
        $validated = $request->validate([
            'budget' => 'required|numeric|min:0',
            'activity_groups' => 'required|array',
            'activity_groups.*' => 'integer|exists:activity_groups,id',
            'place_ids' => 'nullable|array',
            'place_ids.*' => 'integer|exists:places,id',
            'total_estimated' => 'required|numeric|min:0',
            'filters' => 'nullable|array',
        ]);
        
        // Get activity groups
        $activityGroups = ActivityGroup::whereIn('id', $validated['activity_groups'])->get();
        
        // Prepare place IDs
        $placeIds = $validated['place_ids'] ?? [];
        $placesCollection = collect($placeIds)->map(function($id) {
            return (object)['id' => $id];
        });
        
        // Save plan using service
        $plan = $this->service->savePlan(
            $user->id,
            $validated['budget'],
            $activityGroups,
            $placesCollection,
            $validated['total_estimated'],
            $validated['filters'] ?? []
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Plan saved successfully',
            'data' => new PlanResource($plan),
        ]);
    }
    
    /**
     * Save a plan
     * 
     * @OA\Post(
     *     path="/api/plans/{plan}/save",
     *     tags={"Plans"},
     *     summary="Save a plan",
     *     description="Mark a plan as saved",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="plan",
     *         in="path",
     *         description="Plan ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plan saved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Plan saved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Plan not found"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function save(Request $request, Plan $plan)
    {
        $user = $request->user();
        
        // Check if user owns this plan
        if ($plan->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to save this plan',
                'data' => null,
            ], 403);
        }
        
        // Mark as saved
        $plan->update(['is_saved' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Plan saved successfully',
            'data' => new PlanResource($plan),
        ]);
    }
    
    /**
     * Get unsaved plans (not marked as saved)
     *
     * @OA\Get(
     *     path="/api/plans/unsaved",
     *     tags={"Plans"},
     *     summary="Get unsaved plans",
     *     description="Retrieve plans that have not been saved (is_saved = false)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=20)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Unsaved plans retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Unsaved plans retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PlanResource")),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function unsaved(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $plans = Plan::where('user_id', $user->id)
            ->where('is_saved', false)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Unsaved plans retrieved successfully',
            'data' => PlanResource::collection($plans),
            'meta' => [
                'current_page' => $plans->currentPage(),
                'last_page' => $plans->lastPage(),
                'per_page' => $plans->perPage(),
                'total' => $plans->total(),
            ],
        ]);
    }

    /**
     * Get plan details
     * 
     * @OA\Get(
     *     path="/api/plans/{plan}",
     *     tags={"Plans"},
     *     summary="Get plan details",
     *     description="Get detailed information of a specific plan",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="plan",
     *         in="path",
     *         description="Plan ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plan details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Plan details retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Plan not found"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Request $request, Plan $plan)
    {
        $user = $request->user();
        
        // Check if user owns this plan
        if ($plan->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this plan',
                'data' => null,
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Plan details retrieved successfully',
            'data' => new PlanResource($plan),
        ]);
    }
    
    /**
     * Delete a plan
     * 
     * @OA\Delete(
     *     path="/api/plans/{plan}",
     *     tags={"Plans"},
     *     summary="Delete a plan",
     *     description="Delete a saved plan",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="plan",
     *         in="path",
     *         description="Plan ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Plan deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Plan deleted successfully"),
     *             @OA\Property(property="data", type="object", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=404, description="Plan not found"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function destroy(Request $request, Plan $plan)
    {
        $user = $request->user();
        
        // Check if user owns this plan
        if ($plan->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this plan',
                'data' => null,
            ], 403);
        }
        
        // Delete the plan
        $plan->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Plan deleted successfully',
            'data' => null,
        ]);
    }
}