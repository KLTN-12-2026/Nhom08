<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\SubscriptionRepository;
use App\Repositories\UserRepository;
use App\Http\Resources\PremiumStatusResource;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Subscription Service (Simplified)
 * 
 * Business logic cho subscription management
 */
class SubscriptionService extends BaseService
{
    protected $subscriptionRepository;
    protected $userRepository;

    public function __construct(
        SubscriptionRepository $subscriptionRepository,
        UserRepository $userRepository
    ) {
        $this->subscriptionRepository = $subscriptionRepository;
        $this->userRepository = $userRepository;
    }

    /**
     * Check premium status của user
     * 
     * GET /api/subscriptions/status
     */
    public function checkPremiumStatus(int $userId): array
    {
        try {
            $user = $this->userRepository->find($userId);
            
            if (!$user) {
                return $this->errorResponse('User not found', 404);
            }

            return $this->successResponse(
                new PremiumStatusResource($user)
            );
        } catch (\Exception $e) {
            Log::error('SubscriptionService: Error checking premium status', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to check premium status');
        }
    }

    /**
     * Restore purchases từ RevenueCat
     * 
     * POST /api/subscriptions/restore
     */
    public function restorePurchases(int $userId, string $revenueCatCustomerId): array
    {
        try {
            DB::beginTransaction();

            $user = $this->userRepository->find($userId);
            
            if (!$user) {
                DB::rollBack();
                return $this->errorResponse('User not found', 404);
            }

            // Update user's RevenueCat customer ID
            if (!$user->revenuecat_customer_id) {
                $user->update(['revenuecat_customer_id' => $revenueCatCustomerId]);
            }

            // Tìm subscription theo customer ID
            $subscription = $this->subscriptionRepository->findByRevenueCatCustomerId($revenueCatCustomerId);

            if (!$subscription) {
                DB::rollBack();
                return $this->successResponse([
                    'message' => 'No active purchases found',
                    'is_premium' => false,
                ]);
            }

            // Update cho đúng user
            if ($subscription->user_id !== $userId) {
                $subscription->update(['user_id' => $userId]);
            }

            // Update premium status
            $user->updatePremiumStatus();

            DB::commit();

            // Use SubscriptionResource for consistent formatting
            return $this->successResponse([
                'message' => 'Purchases restored successfully',
                'is_premium' => $user->isPremium(),
                'subscription' => new SubscriptionResource($subscription),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('SubscriptionService: Error restoring purchases', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to restore purchases');
        }
    }

    /**
     * Get subscription history
     * 
     * GET /api/subscriptions/history
     */
    public function getSubscriptionHistory(int $userId): array
    {
        try {
            $subscriptions = $this->subscriptionRepository->getUserSubscriptions($userId);

            // SubscriptionResource::collection returns ResourceCollection
            // Need to convert to array for successResponse
            return $this->successResponse([
                'subscriptions' => SubscriptionResource::collection($subscriptions)->resolve(),
            ]);
        } catch (\Exception $e) {
            Log::error('SubscriptionService: Error getting history', [
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to get history');
        }
    }

    /**
     * Handle webhook event từ RevenueCat
     * 
     * Called from RevenueCatWebhookController
     */
    public function handleWebhookEvent(array $eventData): bool
    {
        try {
            DB::beginTransaction();

            $eventType = $eventData['event_type'];
            $customerId = $eventData['revenuecat_customer_id'];

            // Tìm user
            $user = $this->userRepository->findByRevenueCatCustomerId($customerId);

            if (!$user) {
                Log::warning('User not found for webhook', ['customer_id' => $customerId]);
                DB::rollBack();
                return false;
            }

            $eventData['user_id'] = $user->id;

            // Xử lý theo event type
            match($eventType) {
                'initial_purchase', 'renewal' => $this->handlePurchaseOrRenewal($user, $eventData),
                'cancellation' => $this->handleCancellation($user, $eventData),
                'expiration' => $this->handleExpiration($user, $eventData),
                default => null,
            };

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error handling webhook', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Handle purchase/renewal event
     */
    protected function handlePurchaseOrRenewal(User $user, array $eventData): void
    {
        $this->subscriptionRepository->createOrUpdate($eventData);
        $user->updatePremiumStatus();

        Log::info('Purchase/Renewal processed', ['user_id' => $user->id]);
    }

    /**
     * Handle expiration event
     */
    protected function handleExpiration(User $user, array $eventData): void
    {
        $subscription = $this->subscriptionRepository->findByRevenueCatCustomerId(
            $eventData['revenuecat_customer_id']
        );

        if ($subscription) {
            $this->subscriptionRepository->updateStatus($subscription->id, 'expired');
            $user->updatePremiumStatus();

            Log::info('Subscription expired', ['user_id' => $user->id]);
        }
    }

    /**
     * Handle cancellation event
     */
    protected function handleCancellation(User $user, array $eventData): void
    {
        $subscription = $this->subscriptionRepository->findByRevenueCatCustomerId(
            $eventData['revenuecat_customer_id']
        );

        if ($subscription) {
            $this->subscriptionRepository->updateStatus($subscription->id, 'cancelled');

            Log::info('Subscription cancelled', ['user_id' => $user->id]);
        }
    }
}
