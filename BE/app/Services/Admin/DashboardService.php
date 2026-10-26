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
use App\Services\BaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get dashboard data
     */
    public function getDashboardData(Request $request)
    {
        $data = [
            'overview' => $this->getOverviewStats(),
            'recent_activity' => $this->getRecentActivity(),
            'user_growth' => $this->getUserGrowth(),
            'place_growth' => $this->getPlaceGrowth(),
            'transaction_summary' => $this->getTransactionSummary(),
            'top_performers' => $this->getTopPerformers(),
            'system_health' => $this->getSystemHealth(),
        ];

        return $data;
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats()
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_places' => Place::count(),
            'total_reviews' => Review::count(),
            'total_posts' => Post::count(),
            'total_transactions' => WalletTransaction::count(),
            'total_points_circulation' => Wallet::sum('points'),
            'new_users_today' => User::whereDate('created_at', Carbon::today())->count(),
            'new_places_today' => Place::whereDate('created_at', Carbon::today())->count(),
            'new_reviews_today' => Review::whereDate('created_at', Carbon::today())->count(),
        ];
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity()
    {
        $activities = collect();

        // Recent user registrations
        $recentUsers = User::latest()->limit(5)->get(['id', 'name', 'email', 'created_at']);
        foreach ($recentUsers as $user) {
            $activities->push([
                'type' => 'user_registration',
                'message' => "New user registered: {$user->name}",
                'timestamp' => $user->created_at,
                'data' => $user->toArray()
            ]);
        }

        // Recent places
        $recentPlaces = Place::with('user')->latest()->limit(5)->get(['id', 'name', 'user_id', 'created_at']);
        foreach ($recentPlaces as $place) {
            $activities->push([
                'type' => 'place_created',
                'message' => "New place created: {$place->name}",
                'timestamp' => $place->created_at,
                'data' => $place->toArray()
            ]);
        }

        // Recent reviews
        $recentReviews = Review::with(['user', 'place'])->latest()->limit(5)->get(['id', 'rating', 'user_id', 'place_id', 'created_at']);
        foreach ($recentReviews as $review) {
            $activities->push([
                'type' => 'review_created',
                'message' => "New review added: {$review->rating} stars",
                'timestamp' => $review->created_at,
                'data' => $review->toArray()
            ]);
        }

        return $activities->sortByDesc('timestamp')->take(15)->values();
    }

    /**
     * Get user growth data
     */
    private function getUserGrowth()
    {
        $growth = [];
        
        // Last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = User::whereDate('created_at', $date)->count();
            $growth[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count
            ];
        }

        return $growth;
    }

    /**
     * Get place growth data
     */
    private function getPlaceGrowth()
    {
        $growth = [];
        
        // Last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = Place::whereDate('created_at', $date)->count();
            $growth[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count
            ];
        }

        return $growth;
    }

    /**
     * Get transaction summary
     */
    private function getTransactionSummary()
    {
        return [
            'total_earned' => WalletTransaction::where('type', 'earn')->sum('amount'),
            'total_spent' => WalletTransaction::where('type', 'spend')->sum('amount'),
            'net_points' => WalletTransaction::sum('amount'),
            'transactions_today' => WalletTransaction::whereDate('created_at', Carbon::today())->count(),
            'points_earned_today' => WalletTransaction::where('type', 'earn')->whereDate('created_at', Carbon::today())->sum('amount'),
            'points_spent_today' => WalletTransaction::where('type', 'spend')->whereDate('created_at', Carbon::today())->sum('amount'),
        ];
    }

    /**
     * Get top performers
     */
    private function getTopPerformers()
    {
        return [
            'top_users_by_places' => User::withCount('places')
                ->orderBy('places_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'places_count']),
                
            'top_users_by_reviews' => User::withCount('reviews')
                ->orderBy('reviews_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'reviews_count']),
                
            'top_places_by_reviews' => Place::withCount('reviews')
                ->orderBy('reviews_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'reviews_count']),
                
            'top_users_by_points' => Wallet::with('user')
                ->orderBy('points', 'desc')
                ->limit(5)
                ->get(['id', 'user_id', 'points'])
                ->map(function ($wallet) {
                    return [
                        'id' => $wallet->user->id,
                        'name' => $wallet->user->name,
                        'points' => $wallet->points
                    ];
                }),
        ];
    }

    /**
     * Get system health metrics
     */
    private function getSystemHealth()
    {
        return [
            'database_size' => $this->getDatabaseSize(),
            'active_sessions' => $this->getActiveSessions(),
            'error_rate' => $this->getErrorRate(),
            'response_time' => $this->getResponseTime(),
            'uptime' => $this->getUptime(),
        ];
    }

    /**
     * Get database size (mock implementation)
     */
    private function getDatabaseSize()
    {
        // This would typically query the database for actual size
        return '2.5 MB';
    }

    /**
     * Get active sessions (mock implementation)
     */
    private function getActiveSessions()
    {
        // This would typically count active tokens
        return User::whereNotNull('refresh_token')->count();
    }

    /**
     * Get error rate (mock implementation)
     */
    private function getErrorRate()
    {
        // This would typically calculate from logs
        return '0.1%';
    }

    /**
     * Get response time (mock implementation)
     */
    private function getResponseTime()
    {
        // This would typically measure actual response times
        return '120ms';
    }

    /**
     * Get uptime (mock implementation)
     */
    private function getUptime()
    {
        // This would typically calculate from server start time
        return '99.9%';
    }
}
