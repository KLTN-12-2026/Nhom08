<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Place;
use App\Models\Review;
use App\Models\Post;
use App\Models\WalletTransaction;
use App\Models\Friendship;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Media;
use App\Models\Category;
use App\Models\FavoritePlace;
use App\Models\DeviceToken;
use App\Models\Wallet;
use App\Models\Subscription;
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsService
{
    /**
     * Get user statistics
     */
    public function getUserStatistics(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'blocked_users' => User::where('is_blocked', true)->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'regular_users' => User::where('role', 'user')->count(),
            
            // Registration trends
            'new_users_today' => User::whereDate('created_at', Carbon::today())->count(),
            'new_users_this_week' => User::whereBetween('created_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
            'new_users_this_month' => User::whereBetween('created_at', [
                Carbon::now()->startOfMonth(),
                Carbon::now()->endOfMonth()
            ])->count(),
            
            // Registration by date range
            'registrations_by_date' => User::whereBetween('created_at', $dateRange)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
                
            // Revenue by date range
            'revenue_by_date' => Subscription::whereBetween('created_at', $dateRange)
                ->selectRaw('DATE(created_at) as date, 
                    SUM(CASE 
                        WHEN product_id = "premium_monthly.trove" THEN 299000
                        WHEN product_id = "premium_yearly.trove" THEN 1299000
                        ELSE 99000
                    END) as total_amount')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
                
            // Users by role
            'users_by_role' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get(),
                
            // Users by gender
            'users_by_gender' => User::selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get(),
        ];

        return $stats;
    }

    /**
     * Get place statistics
     */
    public function getPlaceStatistics(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        $stats = [
            'total_places' => Place::count(),
            'places_with_reviews' => Place::has('reviews')->count(),
            'places_without_reviews' => Place::doesntHave('reviews')->count(),
            
            // Places by category
            'places_by_category' => Place::join('category_place', 'places.id', '=', 'category_place.place_id')
                ->join('categories', 'category_place.category_id', '=', 'categories.id')
                ->selectRaw('categories.name as category_name, COUNT(DISTINCT places.id) as count')
                ->groupBy('categories.id', 'categories.name')
                ->get(),
                
            // Places created by date range
            'places_by_date' => Place::whereBetween('created_at', $dateRange)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
                
            // Top places by reviews
            'top_places_by_reviews' => Place::withCount('reviews')
                ->withAvg('reviews', 'rating')
                ->orderBy('reviews_count', 'desc')
                ->limit(10)
                ->get(),
                
            // Places by user
            'places_by_user' => Place::join('users', 'places.user_id', '=', 'users.id')
                ->selectRaw('users.name, COUNT(*) as count')
                ->groupBy('users.id', 'users.name')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return $stats;
    }

    /**
     * Get transaction statistics
     */
    public function getTransactionStatistics(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        $stats = [
            'total_transactions' => WalletTransaction::count(),
            'total_points_earned' => WalletTransaction::where('type', 'earn')->sum('amount'),
            'total_points_spent' => WalletTransaction::where('type', 'spend')->sum('amount'),
            
            // Transactions by type
            'transactions_by_type' => WalletTransaction::selectRaw('type, COUNT(*) as count, SUM(amount) as total_points')
                ->groupBy('type')
                ->get(),
                
            // Transactions by date range
            'transactions_by_date' => WalletTransaction::whereBetween('created_at', $dateRange)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(amount) as total_points')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
                
            // Top users by transactions
            'top_users_by_transactions' => WalletTransaction::join('wallets', 'wallet_transactions.wallet_id', '=', 'wallets.id')
                ->join('users', 'wallets.user_id', '=', 'users.id')
                ->selectRaw('users.name, COUNT(*) as transaction_count, SUM(wallet_transactions.amount) as total_points')
                ->groupBy('users.id', 'users.name')
                ->orderBy('transaction_count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return $stats;
    }

    /**
     * Get general system statistics
     */
    public function getGeneralStatistics(Request $request)
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'blocked' => User::where('is_blocked', true)->count(),
            ],
            'places' => [
                'total' => Place::count(),
                'with_reviews' => Place::has('reviews')->count(),
            ],
            'reviews' => [
                'total' => Review::count(),
                'average_rating' => Review::avg('rating'),
            ],
            'posts' => [
                'total' => Post::count(),
            ],
            'friendships' => [
                'total' => Friendship::count(),
                'accepted' => Friendship::where('status', 'accepted')->count(),
                'pending' => Friendship::where('status', 'pending')->count(),
            ],
            'messages' => [
                'total' => Message::count(),
                'today' => Message::whereDate('created_at', Carbon::today())->count(),
            ],
            'notifications' => [
                'total' => Notification::count(),
                'unread' => Notification::where('is_read', false)->count(),
            ],
            'media' => [
                'total' => Media::count(),
            ],
            'wallets' => [
                'total' => Wallet::count(),
                'total_points' => Wallet::sum('points'),
                'average_points' => Wallet::avg('points'),
            ],
        ];

        return $stats;
    }

    /**
     * Get date range from request
     */
    private function getDateRange(Request $request)
    {
        if ($request->filled('start_date') && $request->filled('end_date')) {
            try {
                $start = Carbon::parse($request->get('start_date'))->startOfDay();
                $end = Carbon::parse($request->get('end_date'))->endOfDay();
                return [$start, $end];
            } catch (\Exception $e) {
                // Fallback to default behavior on parse failure
            }
        }
        $days = $request->get('days', 30);
        return [
            Carbon::now()->subDays($days)->startOfDay(),
            Carbon::now()->endOfDay()
        ];
    }
}
