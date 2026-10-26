<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * Subscription Controller
 * 
 * Handle API requests liên quan đến subscriptions
 * 
 * Endpoints:
 * - GET /api/subscriptions/status - Get subscription status
 * - POST /api/subscriptions/restore - Restore purchases
 * - GET /api/subscriptions/history - Get subscription history
 */
class SubscriptionController extends Controller
{
    protected $subscriptionService;

    /**
     * Constructor
     * 
     * Inject SubscriptionService dependency
     */
    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Get subscription status của user hiện tại
     * 
     * Endpoint: GET /api/subscriptions/status
     * 
     * Headers:
     * - Authorization: Bearer {token}
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function status(Request $request): JsonResponse
    {
        // Lấy authenticated user từ Sanctum
        $user = $request->user();

        // Call service để check premium status
        $result = $this->subscriptionService->checkPremiumStatus($user->id);

        // Result từ service đã có format: ['success' => bool, 'data' => array]
        return response()->json($result);
    }

    /**
     * Restore purchases từ RevenueCat
     * 
     * Endpoint: POST /api/subscriptions/restore
     * 
     * Headers:
     * - Authorization: Bearer {token}
     * - Content-Type: application/json
     * 
     * Body:
     * {
     *   "revenuecat_customer_id": "app_user_12345"
     * }
     * 
     * Use case:
     * - User switch devices
     * - User reinstall app
     * - User login on new device
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function restore(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'revenuecat_customer_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Lấy authenticated user
        $user = $request->user();
        $revenueCatCustomerId = $request->input('revenuecat_customer_id');

        // Call service để restore purchases
        $result = $this->subscriptionService->restorePurchases($user->id, $revenueCatCustomerId);

        return response()->json($result);
    }

    /**
     * Get subscription history của user
     * 
     * Endpoint: GET /api/subscriptions/history
     * 
     * Headers:
     * - Authorization: Bearer {token}
     * 
     * Query params:
     * - per_page: Number of items per page (default: 10)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        // Call service để lấy history
        $result = $this->subscriptionService->getSubscriptionHistory($user->id);

        return response()->json($result);
    }

    /**
     * Quick premium check
     * 
     * Endpoint: GET /api/me/premium
     * 
     * Lightweight endpoint để check premium status nhanh
     * Không return full subscription details, chỉ return is_premium flag
     * 
     * Use case:
     * - App startup check
     * - Before accessing premium features
     * - Quick validation
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkPremium(Request $request): JsonResponse
    {
        // Lấy authenticated user
        $user = $request->user();

        // Return quick premium check
        // Sử dụng cached field is_premium từ users table
        // Performance: cực nhanh vì không cần join với subscriptions table
        return response()->json([
            'success' => true,
            'data' => [
                'is_premium' => $user->isPremium(),
                'premium_until' => $user->premium_until?->toIso8601String(),
                'days_remaining' => $user->daysUntilExpiry(),
            ],
        ]);
    }

    /**
     * Sync subscription từ RevenueCat (Manual)
     * 
     * Endpoint: POST /api/subscriptions/sync
     * 
     * Manually trigger sync subscription từ RevenueCat
     * Useful cho troubleshooting khi webhook bị miss
     * 
     * Body:
     * {
     *   "revenuecat_customer_id": "app_user_12345"
     * }
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function sync(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'revenuecat_customer_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $revenueCatCustomerId = $request->input('revenuecat_customer_id');

        // TODO: Call RevenueCat API để fetch latest subscriber info
        // Sau đó update subscription trong database
        // Feature này cần RevenueCatService (tạo sau nếu cần)

        return response()->json([
            'success' => true,
            'message' => 'Subscription sync initiated',
            'data' => [
                'note' => 'This feature requires RevenueCat API integration',
            ],
        ]);
    }
}
