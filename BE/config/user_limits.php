<?php

return [
    /*
    |--------------------------------------------------------------------------
    | User Limits Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration defines the limits for users based on their activity.
    | Limits are applied in order - the first matching rule will be used.
    |
    */

    'enabled' => env('USER_LIMITS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Places View Limits
    |--------------------------------------------------------------------------
    |
    | Define how many places a user can view based on their post count.
    | Rules are evaluated in order, first match wins.
    |
    */

    'places_view_limits' => [
        // Format: ['posts_count' => max_places_limit]
        // If user has 0 posts, they can view 10 places
        0 => 10,
        
        // If user has 1-5 posts, they can view 50 places
        1 => 50,
        
        // If user has 6-10 posts, they can view 100 places
        6 => 100,
        
        // If user has 11-20 posts, they can view 200 places
        11 => 200,
        
        // If user has 21+ posts, they can view unlimited (null = unlimited)
        21 => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Limit
    |--------------------------------------------------------------------------
    |
    | Default limit if no rules match (shouldn't happen with proper config)
    |
    */

    'default_limit' => 10,

    /*
    |--------------------------------------------------------------------------
    | Unlimited Threshold
    |--------------------------------------------------------------------------
    |
    | If user has this many posts or more, they get unlimited access
    | (if not already defined in places_view_limits)
    |
    */

    'unlimited_threshold' => 21,

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Cache user post counts to improve performance
    |
    */

    'cache' => [
        'enabled' => env('USER_LIMITS_CACHE_ENABLED', true),
        'ttl' => env('USER_LIMITS_CACHE_TTL', 3600), // 1 hour in seconds
    ],
];

