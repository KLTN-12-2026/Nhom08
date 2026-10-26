<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ActivityGroupController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\PlaceController;
use App\Http\Controllers\API\PlaceReactionController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\PlanController;
use App\Http\Controllers\API\PostController;
use App\Http\Controllers\API\FavoritePlaceController;
use App\Http\Controllers\API\FriendshipController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\MediaController;
use App\Http\Controllers\API\DeviceTokenController;
use App\Http\Controllers\API\WalletController;
use App\Http\Controllers\API\WalletTransactionController;
use App\Http\Controllers\API\FilterController;
use App\Http\Controllers\API\ConfigController;
use App\Http\Controllers\API\Admin\UserController as AdminUserController;
use App\Http\Controllers\API\Admin\StatisticsController as AdminStatisticsController;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\API\Admin\ActivityGroupController as AdminActivityGroupController;
use App\Http\Controllers\API\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\API\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\API\Admin\PlaceController as AdminPlaceController;
use App\Http\Controllers\API\Admin\TagController as AdminTagController;
use App\Http\Controllers\API\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\API\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\API\Admin\QuoteController as AdminQuoteController;
use App\Http\Controllers\API\Admin\UserLimitController as AdminUserLimitController;
use App\Http\Controllers\API\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\API\Admin\PlaceConfigController as AdminPlaceConfigController;
use App\Http\Controllers\API\QuoteController;
use App\Http\Controllers\API\StatusController;
use App\Http\Controllers\API\TicketController;
use App\Http\Controllers\API\AnnouncementController;
use App\Http\Controllers\API\MovieController;
use App\Http\Controllers\API\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\API\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\API\SearchController;
// RevenueCat IAP Controllers
use App\Http\Controllers\API\SubscriptionController;
use App\Http\Controllers\Webhook\RevenueCatWebhookController;
use App\Http\Controllers\Webhook\SepayWebhookController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('refresh-token');
Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login');

// Simple public health/status check
Route::get('/is-active', [StatusController::class, 'isActive'])->name('is-active');
Route::get('/app-info', [StatusController::class, 'appInfo'])->name('app-info');


// Public route: Get places (no auth required)
Route::get('/places', [PlaceController::class, 'index'])->name('places.index');
Route::get('/admin/places', [AdminPlaceController::class, 'index'])->name('public.admin.places.index');
Route::get('/places/{place}', [PlaceController::class, 'show'])
    ->where('place', '[0-9]+') // Only match numeric IDs to avoid conflict with routes like 'my-places'
    ->name('places.show');
Route::get('/config', [ConfigController::class, 'index'])->name('config.index');
Route::get('/movies/{slug}', [MovieController::class, 'show'])->name('movies.show');
Route::get('/tickets/types', [TicketController::class, 'getTypes'])->name('tickets.types');

Route::get('/activity-groups', [ActivityGroupController::class, 'index'])->name('activity-groups.index');
Route::get('/activity-groups/{activityGroup}', [ActivityGroupController::class, 'show'])->name('activity-groups.show');

// Public route: Get announcements (no auth required)
Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');

// Public routes for categories (read-only)
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/admin/categories', [AdminCategoryController::class, 'index'])->name('public.admin.categories.index');
Route::get('/admin/tags', [AdminTagController::class, 'index'])->name('public.admin.tags.index');

// Public Search API endpoints (no authentication required)
Route::prefix('search')->group(function () {
    Route::get('/places', [SearchController::class, 'searchPlaces'])->name('search.places');
    Route::get('/categories', [SearchController::class, 'searchCategories'])->name('search.categories');
    Route::get('/posts', [SearchController::class, 'searchPosts'])->name('search.posts');
    Route::get('/all', [SearchController::class, 'searchAll'])->name('search.all');
});


/*
|--------------------------------------------------------------------------
| RevenueCat Webhook (Public, but verified)
|--------------------------------------------------------------------------
|
| Webhook endpoint để nhận events từ RevenueCat
| - INITIAL_PURCHASE: User mua subscription
| - RENEWAL: Subscription renew
| - CANCELLATION: User cancel
| - EXPIRATION: Subscription hết hạn
| - BILLING_ISSUE: Vấn đề thanh toán
|
| Security: Verify Authorization header trong controller
|
*/
Route::post('/webhooks/revenuecat', [RevenueCatWebhookController::class, 'handle'])
    ->name('webhooks.revenuecat');

// SePay Webhook
Route::post('/webhooks/sepay', [SepayWebhookController::class, 'handle'])
    ->name('webhooks.sepay');

Route::middleware(["auth:sanctum"])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    Route::put('/me', [AuthController::class, 'updateMe'])->name('me.update');
    Route::post('/me/avatar', [AuthController::class, 'updateAvatar'])->name('me.avatar.update');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
    
    /*
    |--------------------------------------------------------------------------
    | RevenueCat Subscription Routes (Protected)
    |--------------------------------------------------------------------------
    |
    | API endpoints cho subscription management
    | Tất cả routes yêu cầu authentication (Sanctum)
    |
    */
    Route::prefix('subscriptions')->group(function () {
        // GET /api/subscriptions/status
        // Lấy subscription status hiện tại của user
        Route::get('/status', [SubscriptionController::class, 'status'])
            ->name('subscriptions.status');
        
        // POST /api/subscriptions/restore
        // Restore purchases từ RevenueCat (khi switch device)
        Route::post('/restore', [SubscriptionController::class, 'restore'])
            ->name('subscriptions.restore');
        
        // GET /api/subscriptions/history
        // Lấy lịch sử subscription của user
        Route::get('/history', [SubscriptionController::class, 'history'])
            ->name('subscriptions.history');
        
        // POST /api/subscriptions/sync
        // Manually sync subscription từ RevenueCat
        Route::post('/sync', [SubscriptionController::class, 'sync'])
            ->name('subscriptions.sync');
    });
    
    // Quick premium check endpoint
    // GET /api/me/premium
    // Lightweight endpoint để check premium status nhanh
    Route::get('/me/premium', [SubscriptionController::class, 'checkPremium'])
        ->name('me.premium');
    
    Route::get('/filters', [FilterController::class, 'index'])->name('filters.index');
    
    // Categories (write operations require auth)
    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'create'])->name('categories.create');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    });
 
    
    Route::prefix('tags')->group(function () {
        Route::get('/', [TagController::class, 'index'])->name('tags.index');
        Route::post('/', [TagController::class, 'create'])->name('tags.create');
        Route::get('/{tag}', [TagController::class, 'show'])->name('tags.show');
        Route::put('/{tag}', [TagController::class, 'update'])->name('tags.update');
        Route::delete('/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');
    });
    
    Route::prefix('places')->group(function () {
        Route::post('/', [PlaceController::class, 'create'])->name('places.create');
        Route::get('/movie', [PlaceController::class, 'movie'])->name('places.movie');
        Route::get('/my-favorites', [PlaceController::class, 'myFavorites'])->name('places.my-favorites');
        Route::get('/my-places', [PlaceController::class, 'myPlaces'])->name('places.my-places');
        Route::post('/{place}/reactions', [PlaceReactionController::class, 'toggle'])->name('places.reactions.toggle');
        Route::get('/{place}/reactions/stats', [PlaceReactionController::class, 'stats'])->name('places.reactions.stats');
        Route::get('/{place}/reactions/my-reaction', [PlaceReactionController::class, 'myReaction'])->name('places.reactions.my-reaction');
        Route::delete('/{place}/reactions', [PlaceReactionController::class, 'destroy'])->name('places.reactions.destroy');
        Route::post('/{place}/contribute', [PlaceController::class, 'contributeMedia'])->name('places.contribute');

        Route::put('/{place}', [PlaceController::class, 'update'])->name('places.update');
        Route::delete('/{place}', [PlaceController::class, 'destroy'])->name('places.destroy');
    });

    Route::prefix('plans')->group(function () {
        Route::post('', [PlanController::class, 'generate'])->name('plans.generate');
        Route::post('/advanced', [PlanController::class, 'advancedGenerate'])->name('plans.advanced');
        Route::post('/save', [PlanController::class, 'saveNewPlan'])->name('plans.save-new');
        
        // Future endpoints (optional)
        Route::get('/unsaved', [PlanController::class, 'unsaved'])->name('plans.unsaved');
        Route::get('/saved', [PlanController::class, 'saved'])->name('plans.saved');
        Route::get('/{plan}', [PlanController::class, 'show'])->name('plans.show');
        Route::post('/{plan}/save', [PlanController::class, 'save'])->name('plans.save');
        Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('plans.destroy');
    });
    
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index'])->name('reviews.index');
        Route::post('/', [ReviewController::class, 'create'])->name('reviews.create');
        Route::get('/place/{placeId}', [ReviewController::class, 'getByPlace'])->name('reviews.place');
        Route::get('/{review}', [ReviewController::class, 'show'])->name('reviews.show');
        Route::put('/{review}', [ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    });
    
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class, 'index'])->name('posts.index');
        Route::post('/', [PostController::class, 'create'])->name('posts.create');
        Route::get('/{post}', [PostController::class, 'show'])->name('posts.show');
        Route::put('/{post}', [PostController::class, 'update'])->name('posts.update');
        Route::delete('/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    });
    
    Route::prefix('favorite-places')->group(function () {
        Route::get('/', [FavoritePlaceController::class, 'index'])->name('favorite-places.index');
        Route::post('/', [FavoritePlaceController::class, 'create'])->name('favorite-places.create');
        Route::post('/toggle', [FavoritePlaceController::class, 'toggle'])->name('favorite-places.toggle');
        Route::get('/{favoritePlace}', [FavoritePlaceController::class, 'show'])->name('favorite-places.show');
        Route::put('/{favoritePlace}', [FavoritePlaceController::class, 'update'])->name('favorite-places.update');
        Route::delete('/{favoritePlace}', [FavoritePlaceController::class, 'destroy'])->name('favorite-places.destroy');
    });
    
    Route::prefix('friendships')->group(function () {
        Route::get('/', [FriendshipController::class, 'index'])->name('friendships.index');
        Route::post('/', [FriendshipController::class, 'create'])->name('friendships.create');
        Route::get('/{friendship}', [FriendshipController::class, 'show'])->name('friendships.show');
        Route::put('/{friendship}', [FriendshipController::class, 'update'])->name('friendships.update');
        Route::delete('/{friendship}', [FriendshipController::class, 'destroy'])->name('friendships.destroy');
    });
    
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('messages.index');
        Route::post('/', [MessageController::class, 'create'])->name('messages.create');
        Route::get('/{message}', [MessageController::class, 'show'])->name('messages.show');
        Route::put('/{message}', [MessageController::class, 'update'])->name('messages.update');
        Route::delete('/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    });
    
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/', [NotificationController::class, 'create'])->name('notifications.create');
        Route::post('/test', [NotificationController::class, 'testSend'])->name('notifications.test');
        Route::get('/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
        Route::put('/{notification}', [NotificationController::class, 'update'])->name('notifications.update');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });
    
    Route::prefix('media')->group(function () {
        Route::get('/', [MediaController::class, 'index'])->name('media.index');
        Route::post('/', [MediaController::class, 'create'])->name('media.create');
        Route::post('/upload', [MediaController::class, 'uploadSingle'])->name('media.upload');
        Route::post('/upload-multiple', [MediaController::class, 'uploadMultiple'])->name('media.upload-multiple');
        Route::get('/{media}', [MediaController::class, 'show'])->name('media.show');
        Route::put('/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::post('/{media}/transform', [MediaController::class, 'transform'])->name('media.transform');
        Route::delete('/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
    });
    
    Route::prefix('device-tokens')->group(function () {
        Route::get('/', [DeviceTokenController::class, 'index'])->name('device-tokens.index');
        Route::post('/', [DeviceTokenController::class, 'create'])->name('device-tokens.create');
        Route::get('/{deviceToken}', [DeviceTokenController::class, 'show'])->name('device-tokens.show');
        Route::put('/{deviceToken}', [DeviceTokenController::class, 'update'])->name('device-tokens.update');
        Route::delete('/{deviceToken}', [DeviceTokenController::class, 'destroy'])->name('device-tokens.destroy');
    });
    
    Route::prefix('wallets')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('wallets.index');
        Route::post('/', [WalletController::class, 'create'])->name('wallets.create');
        Route::get('/{wallet}', [WalletController::class, 'show'])->name('wallets.show');
        Route::put('/{wallet}', [WalletController::class, 'update'])->name('wallets.update');
        Route::delete('/{wallet}', [WalletController::class, 'destroy'])->name('wallets.destroy');
    });
    
    Route::prefix('wallet-transactions')->group(function () {
        Route::get('/', [WalletTransactionController::class, 'index'])->name('wallet-transactions.index');
        Route::post('/', [WalletTransactionController::class, 'create'])->name('wallet-transactions.create');
        Route::get('/{walletTransaction}', [WalletTransactionController::class, 'show'])->name('wallet-transactions.show');
        Route::put('/{walletTransaction}', [WalletTransactionController::class, 'update'])->name('wallet-transactions.update');
        Route::delete('/{walletTransaction}', [WalletTransactionController::class, 'destroy'])->name('wallet-transactions.destroy');
    });

    Route::prefix('tickets')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('tickets.index');
        Route::post('/', [TicketController::class, 'store'])->name('tickets.store');
        Route::get('/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
        Route::put('/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
        Route::delete('/{ticket}', [TicketController::class, 'destroy'])->name('tickets.destroy');
    });

    // Admin routes
    Route::prefix('admin')->middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('admin.users.index');
            Route::post('/', [AdminUserController::class, 'store'])->name('admin.users.store');
            Route::get('/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
            Route::put('/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
            Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
            Route::post('/{user}/block', [AdminUserController::class, 'toggleBlock'])->name('admin.users.block');
        });

        // User limits (enable/disable global limits)
        Route::prefix('user-limits')->group(function () {
            Route::get('/', [AdminUserLimitController::class, 'show'])->name('admin.user-limits.show');
            Route::put('/', [AdminUserLimitController::class, 'update'])->name('admin.user-limits.update');
        });

        // Place config (auto-approve settings)
        Route::prefix('place-config')->group(function () {
            Route::get('/auto-approve', [AdminPlaceConfigController::class, 'getAutoApprove'])->name('admin.place-config.auto-approve');
            Route::post('/auto-approve/toggle', [AdminPlaceConfigController::class, 'toggleAutoApprove'])->name('admin.place-config.auto-approve.toggle');
        });
        
        Route::prefix('statistics')->group(function () {
            Route::get('/users', [AdminStatisticsController::class, 'users'])->name('admin.statistics.users');
            Route::get('/places', [AdminStatisticsController::class, 'places'])->name('admin.statistics.places');
            Route::get('/transactions', [AdminStatisticsController::class, 'transactions'])->name('admin.statistics.transactions');
            Route::get('/general', [AdminStatisticsController::class, 'general'])->name('admin.statistics.general');
        });
        
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        Route::prefix('activity-groups')->group(function () {
            Route::get('/', [AdminActivityGroupController::class, 'index'])->name('admin.activity-groups.index');
            Route::post('/', [AdminActivityGroupController::class, 'store'])->name('admin.activity-groups.store');
            Route::get('/{activityGroup}', [AdminActivityGroupController::class, 'show'])->name('admin.activity-groups.show');
            Route::put('/{activityGroup}', [AdminActivityGroupController::class, 'update'])->name('admin.activity-groups.update');
            Route::delete('/{activityGroup}', [AdminActivityGroupController::class, 'destroy'])->name('admin.activity-groups.destroy');
            Route::post('/{activityGroup}/categories', [AdminActivityGroupController::class, 'syncCategories'])->name('admin.activity-groups.categories.sync');
        });

        Route::prefix('categories')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index'])->name('admin.categories.index');
            Route::post('/', [AdminCategoryController::class, 'store'])->name('admin.categories.store');
            Route::get('/{category}', [AdminCategoryController::class, 'show'])->name('admin.categories.show');
            Route::put('/{category}', [AdminCategoryController::class, 'update'])->name('admin.categories.update');
            Route::delete('/{category}', [AdminCategoryController::class, 'destroy'])->name('admin.categories.destroy');
        });

        Route::prefix('places')->group(function () {
            Route::get('/', [AdminPlaceController::class, 'index'])->name('admin.places.index');
            Route::post('/', [AdminPlaceController::class, 'store'])->name('admin.places.store');
            Route::get('/{place}', [AdminPlaceController::class, 'show'])->name('admin.places.show');
            Route::put('/{place}', [AdminPlaceController::class, 'update'])->name('admin.places.update');
            Route::delete('/{place}', [AdminPlaceController::class, 'destroy'])->name('admin.places.destroy');
            Route::post('/{place}/approve', [AdminPlaceController::class, 'approve'])->name('admin.places.approve');
            Route::post('/{place}/reject', [AdminPlaceController::class, 'reject'])->name('admin.places.reject');
            Route::post('/{place}/status', [AdminPlaceController::class, 'updateStatus'])->name('admin.places.status');
        });

        Route::prefix('tags')->group(function () {
            Route::get('/', [AdminTagController::class, 'index'])->name('admin.tags.index');
            Route::post('/', [AdminTagController::class, 'store'])->name('admin.tags.store');
            Route::get('/{tag}', [AdminTagController::class, 'show'])->name('admin.tags.show');
            Route::put('/{tag}', [AdminTagController::class, 'update'])->name('admin.tags.update');
            Route::delete('/{tag}', [AdminTagController::class, 'destroy'])->name('admin.tags.destroy');
        });

        Route::prefix('movies')->group(function () {
            Route::get('/', [AdminMovieController::class, 'index'])->name('admin.movies.index');
            Route::post('/', [AdminMovieController::class, 'store'])->name('admin.movies.store');
            Route::get('/detail-from-moveek/{slug}', [AdminMovieController::class, 'getDetailFromMoveek'])->name('admin.movies.detail-from-moveek');
            Route::post('/sync-from-moveek', [AdminMovieController::class, 'syncFromMoveek'])->name('admin.movies.sync');
            Route::get('/{movie}', [AdminMovieController::class, 'show'])->name('admin.movies.show');
            Route::put('/{movie}', [AdminMovieController::class, 'update'])->name('admin.movies.update');
            Route::delete('/{movie}', [AdminMovieController::class, 'destroy'])->name('admin.movies.destroy');
        });

        // Admin Quotes routes
        Route::prefix('quotes')->group(function () {
            Route::get('/', [AdminQuoteController::class, 'index'])->name('admin.quotes.index');
            Route::post('/', [AdminQuoteController::class, 'store'])->name('admin.quotes.store');
            Route::get('/{quote}', [AdminQuoteController::class, 'show'])->name('admin.quotes.show');
            Route::put('/{quote}', [AdminQuoteController::class, 'update'])->name('admin.quotes.update');
            Route::delete('/{quote}', [AdminQuoteController::class, 'destroy'])->name('admin.quotes.destroy');
            Route::post('/{quote}/toggle', [AdminQuoteController::class, 'toggle'])->name('admin.quotes.toggle');
        });

        // Admin Tickets routes
        Route::prefix('tickets')->group(function () {
            Route::get('/', [AdminTicketController::class, 'index'])->name('admin.tickets.index');
            Route::get('/{ticket}', [AdminTicketController::class, 'show'])->name('admin.tickets.show');
            Route::put('/{ticket}/status', [AdminTicketController::class, 'updateStatus'])->name('admin.tickets.update-status');
            Route::put('/{ticket}/assign', [AdminTicketController::class, 'assign'])->name('admin.tickets.assign');
            Route::delete('/{ticket}', [AdminTicketController::class, 'destroy'])->name('admin.tickets.destroy');
        });

        // Admin Announcements routes
        Route::prefix('announcements')->group(function () {
            Route::get('/', [AdminAnnouncementController::class, 'index'])->name('admin.announcements.index');
            Route::post('/', [AdminAnnouncementController::class, 'store'])->name('admin.announcements.store');
            Route::get('/{announcement}', [AdminAnnouncementController::class, 'show'])->name('admin.announcements.show');
            Route::put('/{announcement}', [AdminAnnouncementController::class, 'update'])->name('admin.announcements.update');
            Route::delete('/{announcement}', [AdminAnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');
        });

        // Admin Notifications routes
        Route::prefix('notifications')->group(function () {
            Route::get('/', [AdminNotificationController::class, 'index'])->name('admin.notifications.index');
            Route::get('/{notification}', [AdminNotificationController::class, 'show'])->name('admin.notifications.show');
            Route::post('/send-to-user', [AdminNotificationController::class, 'sendToUser'])->name('admin.notifications.send-to-user');
            Route::post('/send-to-users', [AdminNotificationController::class, 'sendToUsers'])->name('admin.notifications.send-to-users');
            Route::post('/broadcast', [AdminNotificationController::class, 'sendBroadcast'])->name('admin.notifications.broadcast');
            Route::delete('/{notification}', [AdminNotificationController::class, 'destroy'])->name('admin.notifications.destroy');
        });

        // Admin Subscriptions routes
        Route::prefix('subscriptions')->group(function () {
            // GET /api/admin/subscriptions - List all subscriptions with filters
            Route::get('/', [AdminSubscriptionController::class, 'index'])->name('admin.subscriptions.index');
            
            // GET /api/admin/subscriptions/stats - Get subscription statistics
            Route::get('/stats', [AdminSubscriptionController::class, 'stats'])->name('admin.subscriptions.stats');
            
            // GET /api/admin/subscriptions/user/{userId} - Get user subscription history
            Route::get('/user/{userId}', [AdminSubscriptionController::class, 'userHistory'])->name('admin.subscriptions.user-history');
            
            // GET /api/admin/subscriptions/{id} - Get subscription details
            Route::get('/{id}', [AdminSubscriptionController::class, 'show'])->name('admin.subscriptions.show');
            
            // POST /api/admin/subscriptions/{id}/cancel - Cancel subscription
            Route::post('/{id}/cancel', [AdminSubscriptionController::class, 'cancel'])->name('admin.subscriptions.cancel');
        });
    });

    // Public quote endpoint
    Route::get('/quotes/{type}', [QuoteController::class, 'show'])->name('quotes.show');
});
