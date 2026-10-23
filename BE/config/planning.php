<?php

return [
    /**
     * Default budget allocation ratios
     */
    'budget_allocation' => [
        'food'    => 0.5,   // Ăn uống
        'drink'   => 0.3,   // Đồ uống
        'activity' => 0.2,  // (legacy key)
        'checkin' => 0.3,   // Check-in / Giải trí
        'movie'   => 0.4,   // Xem phim
        'date'    => 0.35,  // Hẹn hò / Hoạt động nhẹ
    ],

    /**
     * Price tolerance (±%)
     */
    'price_tolerance' => 0.3, // ±30%

    /**
     * Cache TTL in seconds
     */
    'cache' => [
        'ttl' => 3600, // 1 hour for place recommendations
        'user_preferences_ttl' => 86400, // 24 hours
    ],

    /**
     * Time-based allocation rules
     */
    'time_based_allocation' => [
        'morning' => ['start' => 8, 'end' => 12],
        'afternoon' => ['start' => 12, 'end' => 17],
        'dinner' => ['start' => 17, 'end' => 21],
        'night' => ['start' => 21, 'end' => 24],
    ],
];