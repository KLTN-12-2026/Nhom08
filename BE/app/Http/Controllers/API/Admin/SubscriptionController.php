<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\SubscriptionResource;
use App\Models\Subscription;
use App\Models\User;
use App\Repositories\SubscriptionRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Admin Subscription Controller
 * 
 * Quản lý subscriptions cho Admin Dashboard
 * 
 * Endpoints:
 * - GET /api/admin/subscriptions - List all subscriptions
 * - GET /api/admin/subscriptions/{id} - Get subscription details
 * - POST /api/admin/subscriptions/{id}/cancel - Cancel subscription
 * - GET /api/admin/subscriptions/stats - Get subscription statistics
 */
class SubscriptionController extends Controller
{
    protected $subscriptionRepository;

    public function __construct(SubscriptionRepository $subscriptionRepository)
    {
        $this->subscriptionRepository = $subscriptionRepository;
    }

    /**
     * Get all subscriptions with filters
     * 
     * GET /api/admin/subscriptions
     * 
     * Query Parameters:
     * - page: int (default: 1)
     * - per_page: int (default: 30)
     * - status: string (active|cancelled|expired)
     * - platform: string (ios|android)
     * - search: string (search by user email/username)
     * - sort_by: string (created_at|expires_at) (default: created_at)
     * - sort_order: string (asc|desc) (default: desc)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'per_page' => 'nullable|integer|min:1|max:100',
            'status' => 'nullable|in:active,cancelled,expired',
            'platform' => 'nullable|in:ios,android,transfer',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|in:created_at,expires_at',
            'sort_order' => 'nullable|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $perPage = $request->input('per_page', 30);
        $status = $request->input('status');
        $platform = $request->input('platform');
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $query = Subscription::query()->with('user');

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by platform
        if ($platform) {
            $query->where('platform', $platform);
        }

        // Search by user email or username
        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Sort
        $query->orderBy($sortBy, $sortOrder);

        $subscriptions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Subscriptions retrieved successfully',
            'data' => [
                'subscriptions' => SubscriptionResource::collection($subscriptions->items()),
                'pagination' => [
                    'current_page' => $subscriptions->currentPage(),
                    'per_page' => $subscriptions->perPage(),
                    'total' => $subscriptions->total(),
                    'last_page' => $subscriptions->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Get subscription details
     * 
     * GET /api/admin/subscriptions/{id}
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $subscription = Subscription::with('user')->find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subscription retrieved successfully',
            'data' => new SubscriptionResource($subscription),
        ]);
    }

    /**
     * Get subscription statistics
     * 
     * GET /api/admin/subscriptions/stats
     * 
     * Returns:
     * - Total active subscriptions
     * - Total cancelled subscriptions
     * - Total expired subscriptions
     * - Revenue breakdown by platform
     * - Active subscribers count
     * - Churn rate
     * 
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $totalActive = Subscription::where('status', 'active')->count();
        $totalCancelled = Subscription::where('status', 'cancelled')->count();
        $totalExpired = Subscription::where('status', 'expired')->count();
        $totalSubscriptions = Subscription::count();

        $iosCount = Subscription::where('status', 'active')
            ->where('platform', 'ios')->count();
        $androidCount = Subscription::where('status', 'active')
            ->where('platform', 'android')->count();
        $transferCount = Subscription::where('status', 'active')
            ->where('platform', 'transfer')->count();

        // Active subscribers (unique users with active subscription)
        $activeSubscribers = User::whereHas('subscriptions', function ($q) {
            $q->where('status', 'active');
        })->count();

        // Churn rate (cancelled / total) * 100
        $churnRate = $totalSubscriptions > 0 
            ? round(($totalCancelled / $totalSubscriptions) * 100, 2) 
            : 0;

        return response()->json([
            'success' => true,
            'message' => 'Statistics retrieved successfully',
            'data' => [
                'overview' => [
                    'total_subscriptions' => $totalSubscriptions,
                    'active' => $totalActive,
                    'cancelled' => $totalCancelled,
                    'expired' => $totalExpired,
                ],
                'platform_breakdown' => [
                    'ios' => $iosCount,
                    'android' => $androidCount,
                    'transfer' => $transferCount,
                ],
                'metrics' => [
                    'active_subscribers' => $activeSubscribers,
                    'churn_rate' => $churnRate,
                ],
            ],
        ]);
    }

    /**
     * Cancel subscription (Admin action)
     * 
     * POST /api/admin/subscriptions/{id}/cancel
     * 
     * Note: This only updates status in database
     * Admin should also cancel in RevenueCat dashboard manually
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function cancel(int $id): JsonResponse
    {
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
            ], 404);
        }

        if ($subscription->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Subscription is already cancelled',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update subscription status
            $subscription->update(['status' => 'cancelled']);

            // Update user premium status
            $user = $subscription->user;
            if ($user) {
                $user->updatePremiumStatus();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription cancelled successfully',
                'data' => new SubscriptionResource($subscription->fresh()),
                'note' => 'Please also cancel this subscription in RevenueCat dashboard',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get subscription history for a specific user
     * 
     * GET /api/admin/subscriptions/user/{userId}
     * 
     * @param int $userId
     * @return JsonResponse
     */
    public function userHistory(int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $subscriptions = Subscription::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'User subscription history retrieved successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'is_premium' => $user->isPremium(),
                ],
                'subscriptions' => SubscriptionResource::collection($subscriptions),
            ],
        ]);
    }
}
