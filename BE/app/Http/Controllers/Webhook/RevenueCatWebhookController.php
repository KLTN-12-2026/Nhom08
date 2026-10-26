<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * RevenueCat Webhook Controller (Simplified)
 * 
 * Nhận webhooks từ RevenueCat
 * POST /api/webhooks/revenuecat
 */
class RevenueCatWebhookController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Handle webhook từ RevenueCat
     * 
     * Flow:
     * 1. Verify Authorization header
     * 2. Parse event
     * 3. Process event
     * 4. Return 200 (luôn return 200 để RevenueCat không retry)
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Verify webhook
            if (!$this->verifyWebhook($request)) {
                Log::warning('Webhook verification failed', ['ip' => $request->ip()]);
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get event data
            $event = $request->input('event');
            
            if (!$event) {
                Log::error('Missing event data');
                return response()->json(['error' => 'Invalid payload'], 400);
            }

            // Log event
            Log::info('Webhook received', [
                'type' => $event['type'] ?? 'unknown',
                'user_id' => $event['app_user_id'] ?? null,
            ]);

            // Process event
            $this->processEvent($event);

            // Return 200 OK
            return response()->json(['success' => true]);
            
        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
            ]);
            
            // Return 200 để không retry
            return response()->json(['success' => true]);
        }
    }

    /**
     * Verify webhook qua Authorization header
     */
    protected function verifyWebhook(Request $request): bool
    {
        $secret = config('revenuecat.webhook.secret');
        
        // Skip verification nếu chưa config (dev only)
        if (!$secret) {
            Log::warning('RevenueCat: No webhook secret configured');
            return true;
        }

        // Check IP whitelist (nếu có config)
        $allowedIps = config('revenuecat.webhook.allowed_ips', []);
        if (!empty($allowedIps)) {
            $clientIp = $request->ip();
            if (!in_array($clientIp, $allowedIps)) {
                Log::warning('RevenueCat: IP not whitelisted', ['ip' => $clientIp]);
                return false;
            }
        }

        $authHeader = $request->header('Authorization');
        return $authHeader === 'Bearer ' . $secret;
    }

    /**
     * Process event và delegate cho Service
     */
    protected function processEvent(array $event): void
    {
        $eventData = [
            'event_type' => strtolower($event['type']),
            'revenuecat_customer_id' => $event['app_user_id'],
            'product_id' => $event['product_id'] ?? null,
            'platform' => $this->getPlatform($event['store'] ?? ''),
            'status' => $this->getStatus($event['type']),
            'expires_at' => isset($event['expiration_at_ms']) 
                ? Carbon::createFromTimestampMs($event['expiration_at_ms']) 
                : null,
        ];
        
        $this->subscriptionService->handleWebhookEvent($eventData);
    }

    /**
     * Get platform từ store
     */
    protected function getPlatform(string $store): string
    {
        return match($store) {
            'APP_STORE' => 'ios',
            'PLAY_STORE' => 'android',
            default => 'ios',
        };
    }

    /**
     * Get status từ event type
     */
    protected function getStatus(string $eventType): string
    {
        return match($eventType) {
            'INITIAL_PURCHASE', 'RENEWAL' => 'active',
            'CANCELLATION' => 'cancelled',
            'EXPIRATION' => 'expired',
            default => 'active',
        };
    }
}
