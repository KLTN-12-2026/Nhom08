<?php

namespace App\Services;

use App\Enums\PlaceStatusEnum;
use App\Models\FavoritePlace;
use App\Models\Place;
use App\Models\Review;
use App\Models\User;
use App\Models\Tag;
use App\Repositories\PlaceRepository;
use App\Services\UserService;
use App\Services\ConfigService;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityGroup;

class PlaceService extends BaseService
{
    protected $repository;
    protected $userService;
    protected $configService;

    public function __construct(PlaceRepository $repository, UserService $userService, ConfigService $configService)
    {
        $this->repository = $repository;
        $this->userService = $userService;
        $this->configService = $configService;
    }

    public function all($request)
    {
        // Get user limit
        $user = $request->user();
        $limit = $this->userService->getPlacesViewLimit($user);

        // Add limit to request params if set
        $requestParams = $request->all();
        if ($limit !== null) {
            $requestParams['max_results'] = $limit;
        }

        // Normalize activity_group_ids if provided (pass directly to repository)
        if (!empty($requestParams['activity_group_ids'])) {
            $requestParams['activity_group_ids'] = $this->normalizeArrayInput($requestParams['activity_group_ids']);
        }

        // Create a new request with limit
        $modifiedRequest = new \Illuminate\Http\Request($requestParams);
        $modifiedRequest->setUserResolver($request->getUserResolver());

        $data = $this->repository->all($modifiedRequest->all());
        // Load categories relationship and reviews count/avg for all places in the collection
        if ($data && method_exists($data, 'getCollection')) {
            $collection = $data->getCollection();
            $collection->load(['categories', 'activityGroups', 'media']);
            // Load reviews count and average rating efficiently
            $placeIds = $collection->pluck('id')->toArray();
            if (!empty($placeIds)) {
                $reviewsStats = DB::table('reviews')
                    ->whereIn('place_id', $placeIds)
                    ->select('place_id', DB::raw('COUNT(*) as reviews_count'), DB::raw('AVG(rating) as reviews_avg_rating'))
                    ->groupBy('place_id')
                    ->get()
                    ->keyBy('place_id');
                
                foreach ($collection as $place) {
                    if (isset($reviewsStats[$place->id])) {
                        $place->setAttribute('reviews_count', $reviewsStats[$place->id]->reviews_count);
                        $place->setAttribute('reviews_avg_rating', $reviewsStats[$place->id]->reviews_avg_rating ?? 0);
                    } else {
                        $place->setAttribute('reviews_count', 0);
                        $place->setAttribute('reviews_avg_rating', 0);
                    }
                }
            }
        } elseif ($data && is_iterable($data)) {
            foreach ($data as $place) {
                if ($place instanceof Place) {
                    $place->load(['categories', 'media']);
                }
            }
        }
        return $data;
    }

    public function create(array $data)
    {
        $categoryIds = $data['category_ids'] ?? null;
        $activityGroupIds = $data['activity_group_ids'] ?? null;
        $tagNames = $data['tags'] ?? null;
        $rating = $data['rating'] ?? null;
        $reviewComment = $data['review_comment'] ?? null;
        $userId = $data['user_id'] ?? null;
        
        // Remove fields that are not directly stored in places table
        unset($data['category_ids'], $data['activity_group_ids'], $data['tags'], $data['review_comment']);
        
        // Set default status if not set:
        // - Check global auto-approve config first
        // - If enabled, all places auto-approve
        // - Otherwise, admin/premium users auto-approve, others -> WAITING
        if (!isset($data['status'])) {
            $globalAutoApprove = $this->configService->get('places.auto_approve', false);
            $globalAutoApprove = filter_var($globalAutoApprove, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $globalAutoApprove;

            if ($globalAutoApprove) {
                // Global auto-approve enabled: approve all
                $data['status'] = PlaceStatusEnum::APPROVED->value;
            } else {
                // OPTIMIZATION: Get user from cache or session instead of DB query
                // Pass user object from controller if possible
                $autoApprove = false;

                if ($userId !== null) {
                    // Try to get user from cache first (if implemented)
                    // Otherwise fall back to DB query
                    $user = User::find($userId);

                    if ($user) {
                        // Rule: admin or premium tier (pro/enterprise) auto-approve
                        $isAdmin = ($user->role === \App\Enums\RoleEnum::ADMIN->value);
                        
                        // OPTIMIZATION: Cache premium status check
                        $isPremium = \Illuminate\Support\Facades\Cache::remember(
                            "user.{$userId}.is_premium",
                            now()->addMinutes(10),
                            fn() => $user->isPremium()
                        );

                        $autoApprove = $isAdmin || $isPremium;
                    }
                }

                $data['status'] = $autoApprove
                    ? PlaceStatusEnum::APPROVED->value
                    : PlaceStatusEnum::WAITING->value;
            }
        }
        
        // Note: rating is kept in $data to be saved to places table
        // It will also be used to create a review
        
        // Xử lý tags: tạo tag nếu chưa có, lưu tag_ids vào JSON
        if ($tagNames !== null && is_array($tagNames)) {
            $tagIds = $this->getOrCreateTagIds($tagNames);
            $data['tag_ids'] = $tagIds;
        }
        
        // All DB operations in implicit transaction (called from controller)
        $place = parent::create($data);
        
        if ($categoryIds !== null) {
            $place->categories()->sync($categoryIds);
        }

        // Sync activity groups if provided
        if ($activityGroupIds !== null) {
            $place->activityGroups()->sync($activityGroupIds);
        }
        
        // Tự động tạo review nếu có rating
        // Review này sẽ được tạo bởi user tạo place
        if ($rating !== null && $userId !== null) {
            Review::create([
                'user_id' => $userId,
                'place_id' => $place->id,
                'rating' => $rating,
                'comment' => $reviewComment,
            ]);
        }
        
        // OPTIMIZATION: Only load relationships that are needed
        // Let PlaceResource decide what to load to avoid over-fetching
        $place->load(['categories', 'activityGroups']);
        
        return $place;
    }

    public function update(array $data, $id)
    {
        $categoryIds = $data['category_ids'] ?? null;
        $activityGroupIds = $data['activity_group_ids'] ?? null;
        $tagNames = $data['tags'] ?? null;
        unset($data['category_ids'], $data['activity_group_ids'], $data['tags']);
        
        // Xử lý tags: tạo tag nếu chưa có, lưu tag_ids vào JSON
        if ($tagNames !== null && is_array($tagNames)) {
            $tagIds = $this->getOrCreateTagIds($tagNames);
            $data['tag_ids'] = $tagIds;
        }
        
        $place = parent::update($data, $id);
        
        if ($place && $categoryIds !== null) {
            $place->categories()->sync($categoryIds);
        }

        // Sync activity groups if provided
        if ($place && $activityGroupIds !== null) {
            $place->activityGroups()->sync($activityGroupIds);
        }

        if ($place) {
            $place->load(['categories', 'activityGroups']);
        }
        
        return $place;
    }

    protected function getOrCreateTagIds(array $tagNames): array
    {
        // Loại bỏ duplicate và empty
        $tagNames = array_unique(array_filter($tagNames));
        
        if (empty($tagNames)) {
            return [];
        }
        
        // Tìm hoặc tạo tags
        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $tag = Tag::firstOrCreate(['name' => $tagName]);
            $tagIds[] = $tag->id;
        }
        
        return $tagIds;
    }

    /**
     * Get favorite places for a user
     */
    public function getMyFavorites($userId, $request)
    {
        // Get favorite place IDs for the user
        $favoritePlaceIds = FavoritePlace::where('user_id', $userId)
            ->pluck('place_id')
            ->toArray();

        if (empty($favoritePlaceIds)) {
            // Return empty pagination result
            return Place::whereIn('id', [])->paginate($request->input('per_page', 10));
        }

        // Query places directly from database
        $query = Place::whereIn('id', $favoritePlaceIds);

        // Apply search query if exists
        if ($request->has('query') && !empty($request->input('query'))) {
            $searchTerm = $request->input('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('address', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Load relationships
        $query->with(['categories', 'media']);

        // Apply pagination - support both per_page/page and limit/skip
        $limit = $request->input('limit') ?? $request->input('per_page', 20);
        $skip = $request->input('skip');
        
        if ($skip !== null) {
            // Calculate page from skip and limit
            $page = floor($skip / $limit) + 1;
            $places = $query->paginate($limit, ['*'], 'page', $page);
        } else {
            $page = $request->input('page', 1);
            $places = $query->paginate($limit, ['*'], 'page', $page);
        }
        
        // Load reviews count and average rating efficiently
        if ($places->count() > 0) {
            $placeIds = $places->pluck('id')->toArray();
            $reviewsStats = DB::table('reviews')
                ->whereIn('place_id', $placeIds)
                ->select('place_id', DB::raw('COUNT(*) as reviews_count'), DB::raw('AVG(rating) as reviews_avg_rating'))
                ->groupBy('place_id')
                ->get()
                ->keyBy('place_id');
            
            foreach ($places as $place) {
                if (isset($reviewsStats[$place->id])) {
                    $place->setAttribute('reviews_count', $reviewsStats[$place->id]->reviews_count);
                    $place->setAttribute('reviews_avg_rating', $reviewsStats[$place->id]->reviews_avg_rating ?? 0);
                } else {
                    $place->setAttribute('reviews_count', 0);
                    $place->setAttribute('reviews_avg_rating', 0);
                }
            }
        }
        
        return $places;
    }

    /**
     * Get places created by the current user, optionally filtered by status
     * - status: int|int[]|comma string (0=waiting,1=approved,2=rejected)
     */
    public function getMyPlaces(int $userId, $request)
    {
        // Base query: places created by this user
        $query = Place::where('user_id', $userId);

        // Optional status filter
        $status = $request->input('status');
        if ($status !== null && $status !== '') {
            // Support array or comma-separated string
            if (is_string($status) && str_contains($status, ',')) {
                $status = array_map('trim', explode(',', $status));
            }

            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        // Apply search query if exists
        if ($request->has('query') && !empty($request->input('query'))) {
            $searchTerm = $request->input('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('address', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Apply sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Load relationships
        $query->with(['categories', 'media']);

        // Pagination (reuse per_page/page params)
        $limit = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        $places = $query->paginate($limit, ['*'], 'page', $page);

        // Load reviews count and average rating efficiently
        if ($places->count() > 0) {
            $placeIds = $places->pluck('id')->toArray();
            $reviewsStats = DB::table('reviews')
                ->whereIn('place_id', $placeIds)
                ->select('place_id', DB::raw('COUNT(*) as reviews_count'), DB::raw('AVG(rating) as reviews_avg_rating'))
                ->groupBy('place_id')
                ->get()
                ->keyBy('place_id');
            
            foreach ($places as $place) {
                if (isset($reviewsStats[$place->id])) {
                    $place->setAttribute('reviews_count', $reviewsStats[$place->id]->reviews_count);
                    $place->setAttribute('reviews_avg_rating', $reviewsStats[$place->id]->reviews_avg_rating ?? 0);
                } else {
                    $place->setAttribute('reviews_count', 0);
                    $place->setAttribute('reviews_avg_rating', 0);
                }
            }
        }

        return $places;
    }

    private function normalizeArrayInput($value): array
    {
        if ($value === null || $value === '' || $value === []) {
            return [];
        }

        $array = is_array($value)
            ? $value
            : (is_string($value) ? explode(',', $value) : [$value]);

        return array_values(array_filter(array_map(function ($item) {
            return (int) trim((string) $item);
        }, $array), function ($id) {
            return $id > 0;
        }));
    }

    /**
     * Update place status (approve/reject)
     * @param int $placeId
     * @param int $status
     * @param string|null $adminNotes
     * @return Place
     */
    public function updateStatus(int $placeId, int $status, ?string $adminNotes = null): Place
    {
        $place = $this->repository->find($placeId);
        
        $place->update([
            'status' => $status,
            'admin_notes' => $adminNotes,
        ]);
        
        return $place->fresh();
    }
}
