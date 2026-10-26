<?php

namespace App\Services;

use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Models\Wallet;
use App\Repositories\UserRepository;
use App\Services\ConfigService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService extends BaseService 
{
    protected $repository;
    protected $configService;

    public function __construct(UserRepository $repository, ConfigService $configService)
    {
        $this->repository = $repository;
        $this->configService = $configService;
    }

    /**
     * Get all users with pagination and filtering
     */
    public function getAllUsers(Request $request)
    {
        $query = User::with(['wallet', 'places', 'reviews', 'posts', 'sentFriendships', 'receivedFriendships']);

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('is_blocked') && $request->is_blocked !== null) {
            $query->where('is_blocked', $request->is_blocked);
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return [
            'users' => UserResource::collection($users->items()),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ]
        ];
    }

    /**
     * Create a new user
     */
    public function createUser($request)
    {
        return DB::transaction(function () use ($request) {
            // Create user
            $user = $this->repository->create([
                'username' => $request->email,
                'email' => $request->email,
                'hashed_password' => Hash::make($request->password),
                'password' => Hash::make($request->password),
                'name' => $request->name,
                'phone_number' => $request->phone_number,
                'role' => $request->role,
                'gender' => $request->gender,
                'is_active' => true,
                'is_blocked' => false,
            ]);

            // Create wallet for the user
            Wallet::create([
                'user_id' => $user->id,
                'points' => 0,
                'level' => 1,
                'total_earned' => 0,
                'total_spent' => 0,
            ]);

            return new UserResource($user->load(['wallet', 'places', 'reviews', 'posts', 'sentFriendships', 'receivedFriendships']));
        });
    }

    /**
     * Get user details
     */
    public function getUserDetails(User $user)
    {
        $user->load(['wallet', 'places', 'reviews', 'posts', 'sentFriendships', 'receivedFriendships']);
        return new UserResource($user);
    }

    /**
     * Update user
     */
    public function updateUser($request, User $user)
    {
        $updateData = [];

        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }

        if ($request->has('email')) {
            $updateData['email'] = $request->email;
            $updateData['username'] = $request->email;
        }

        if ($request->has('phone_number')) {
            $updateData['phone_number'] = $request->phone_number;
        }

        if ($request->has('role')) {
            $updateData['role'] = $request->role;
        }

        if ($request->has('gender')) {
            $updateData['gender'] = $request->gender;
        }

        if ($request->has('avatar')) {
            $updateData['avatar'] = $request->avatar;
        }

        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->is_active;
        }

        if ($request->has('is_blocked')) {
            $updateData['is_blocked'] = $request->is_blocked;
        }

        $user->update($updateData);
        $user->load(['wallet', 'places', 'reviews', 'posts', 'sentFriendships', 'receivedFriendships']);

        return new UserResource($user);
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user)
    {
        $user->delete();
    }

    /**
     * Toggle user block status
     */
    public function toggleUserBlock(User $user)
    {
        $user->update(['is_blocked' => !$user->is_blocked]);
        $user->load(['wallet', 'places', 'reviews', 'posts', 'sentFriendships', 'receivedFriendships']);

        return new UserResource($user);
    }

    /**
     * Get places view limit: 15 for guests/users with no places, unlimited if has places
     * 
     * @param User|null $user
     * @return int|null Returns 15 for guests/users with no places, null for unlimited
     */
    public function getPlacesViewLimit(?User $user): ?int
    {
        // If feature disabled, return unlimited
        $enabled = $this->configService->get('user_limits.enabled', true);
        if (!$enabled) {
            return null;
        }

        // If no user (guest), return limit 15
        if (!$user) {
            return 15;
        }

        // Check if user has any places (direct query, no cache)
        $hasPlaces = $user->places()->exists();

        // If no places → limit 15, if has places → unlimited
        return $hasPlaces ? null : 15;
    }
}