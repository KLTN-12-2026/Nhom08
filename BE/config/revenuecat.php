<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RevenueCat API Key (Secret)
    |--------------------------------------------------------------------------
    |
    | Secret API key từ RevenueCat Dashboard -> API Keys
    | Dùng để call RevenueCat API từ backend
    |
    */
    'api_key' => env('REVENUECAT_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | RevenueCat Public Key

    /*
    |--------------------------------------------------------------------------
    | RevenueCat API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration cho RevenueCat REST API
    | Docs: https://www.revenuecat.com/docs/api-v1
    |
    */

    'api' => [
        // Secret API key (sk_xxx) - For server-side calls
        'key' => env('REVENUECAT_API_KEY'),
        
        // Public key - For client-side SDK (optional for backend)
        'public_key' => env('REVENUECAT_PUBLIC_KEY'),
        
        // Project ID (optional - for advanced API usage)
        'project_id' => env('REVENUECAT_PROJECT_ID'),
        
        // API version (v1 hoặc v2)
        'version' => env('REVENUECAT_API_VERSION', 'v2'),
        
        // API base URL
        'base_url' => env('REVENUECAT_API_BASE_URL', 'https://api.revenuecat.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Settings cho webhook từ RevenueCat
    | Setup: RevenueCat Dashboard → Integrations → Webhooks
    |
    */

    'webhook' => [
        // Webhook secret để verify requests
        // RevenueCat gửi: Authorization: Bearer {secret}
        'secret' => env('REVENUECAT_WEBHOOK_SECRET'),
        
        // Webhook endpoint (relative to base URL)
        'endpoint' => env('REVENUECAT_WEBHOOK_ENDPOINT', 'api/webhooks/revenuecat'),
        
        // Timestamp tolerance (seconds) - Cho replay attack protection
        'tolerance' => env('REVENUECAT_WEBHOOK_TOLERANCE', 300),
        
        // Route group ('web', 'api', etc.)
        'route_group' => env('REVENUECAT_ROUTE_GROUP', 'api'),
        
        // Whitelist IPs (comma-separated) - Optional extra security
        // Example: '192.168.1.1,192.168.1.2'
        'allowed_ips' => array_filter(explode(',', env('REVENUECAT_WEBHOOK_ALLOWED_IPS', ''))),
        
        // Rate limiting
        'rate_limit' => [
            'enabled' => env('REVENUECAT_WEBHOOK_RATE_LIMIT_ENABLED', true),
            'max_attempts' => env('REVENUECAT_WEBHOOK_RATE_LIMIT_ATTEMPTS', 60),
            'decay_minutes' => env('REVENUECAT_WEBHOOK_RATE_LIMIT_DECAY', 1),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Product IDs
    |--------------------------------------------------------------------------
    |
    | Product/Subscription IDs từ App Store / Google Play
    | Must match IDs trong RevenueCat Dashboard và store consoles
    |
    */

    'products' => [
        'monthly' => env('REVENUECAT_PRODUCT_MONTHLY', 'premium_monthly.trove'),
        'yearly' => env('REVENUECAT_PRODUCT_YEARLY', 'premium_yearly.trove'),
        'lifetime' => env('REVENUECAT_PRODUCT_LIFETIME'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Entitlements
    |--------------------------------------------------------------------------
    |
    | Entitlements = quyền lợi khi mua subscription
    | Example: 'premium', 'pro', 'vip'
    |
    */

    'entitlements' => [
        'premium' => env('REVENUECAT_ENTITLEMENT_PREMIUM', 'premium'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Cache settings cho RevenueCat data (subscriber info, offerings, etc.)
    | Giúp giảm API calls và improve performance
    |
    */

    'cache' => [
        // Enable/disable caching
        'enabled' => env('REVENUECAT_CACHE_ENABLED', true),
        
        // Cache TTL (time to live) in seconds
        'ttl' => env('REVENUECAT_CACHE_TTL', 3600), // 1 hour
        
        // Cache key prefix
        'prefix' => env('REVENUECAT_CACHE_PREFIX', 'revenuecat'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Log RevenueCat events để debugging và monitoring
    |
    */

    'logging' => [
        // Enable/disable logging
        'enabled' => env('REVENUECAT_LOGGING_ENABLED', true),
        
        // Log channel (từ config/logging.php)
        'channel' => env('REVENUECAT_LOGGING_CHANNEL', 'stack'),
        
        // Log level: debug, info, warning, error
        'level' => env('REVENUECAT_LOGGING_LEVEL', 'debug'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Error Handling Configuration
    |--------------------------------------------------------------------------
    |
    | Cách xử lý errors khi gọi RevenueCat API
    |
    */

    'error_handling' => [
        // Throw exceptions khi có error
        'throw_exceptions' => env('REVENUECAT_THROW_EXCEPTIONS', false),
        
        // Log errors
        'log_errors' => env('REVENUECAT_LOG_ERRORS', true),
        
        // Retry on error (automatic retry)
        'retry_on_error' => env('REVENUECAT_RETRY_ON_ERROR', true),
        
        // Max số lần retry
        'max_retries' => env('REVENUECAT_MAX_RETRIES', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Other Configuration
    |--------------------------------------------------------------------------
    */

    // Environment: production, sandbox
    'environment' => env('REVENUECAT_ENVIRONMENT', 'production'),
    
    // Default currency
    'currency' => env('REVENUECAT_CURRENCY', 'USD'),
    
    // User model
    'model' => [
        'user' => config('auth.providers.users.model', \App\Models\User::class),
    ],

];
