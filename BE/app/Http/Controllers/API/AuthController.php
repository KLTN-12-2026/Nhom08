<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\CreateUserRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Resources\User\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $service;
    public function __construct(AuthService $service)
    {
        $this->service = $service;
    }

    /**
     * Summary of register
     * @param \App\Http\Requests\Auth\CreateUserRequest $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/register",
     *     tags={"Auth"},
     *     summary="Register",
     *     description="Register a new user account",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password", "password_confirmation", "name"},
     *             @OA\Property(property="email", type="string", example="john@example.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", example="password123"),
     *             @OA\Property(property="name", type="string", example="John Doe", description="Required, min 2 characters, max 200 characters"),
     *             @OA\Property(property="phone_number", type="string", example="0123456789", description="Optional, max 20 characters")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object", example="..."),
     *                 @OA\Property(property="access_token", type="string", example="1|w1BYT5mmAUSvNqFNnldp43RPH08DZ2cEiSi92QXG170d182a"),
     *                 @OA\Property(property="refresh_token", type="string", example="your-refresh-token"),
     *                 @OA\Property(property="type", type="string", example="Bearer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed."),
     *             @OA\Property(property="data", type="object", example={})
     *         )
     *     )
     * )
     */
    public function register(CreateUserRequest $request)
    {
        $data = $this->service->register($request);
        return $this->response($data, "User registered successfully", 201);
    }

    /**
     * Summary of login
     * @param \App\Http\Requests\Auth\LoginRequest $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Auth"},
     *     summary="Login",
     *     description="Login to the system",
     *     @OA\Parameter(
     *         name="platform",
     *         in="query",
     *         required=true,
     *         description="Platform to login (0 for web, 1 for mobile)",
     *         @OA\Schema(type="integer", example="0")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", example="H6mWc@example.com"),
     *             @OA\Property(property="password", type="string", example="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object", example="..."),
     *                 @OA\Property(property="access_token", type="string", example="1|w1BYT5mmAUSvNqFNnldp43RPH08DZ2cEiSi92QXG170d182a"),
     *                 @OA\Property(property="refresh_token", type="string", example="your-refresh-token"),
     *                 @OA\Property(property="type", type="string", example="Bearer")
     *             )
     *         )
     *     )
     * )
     */
    public function login(LoginRequest $request)
    {
        $data = $this->service->login($request);
        return $this->response($data);
    }

    /**
     * Summary of refreshToken
     * @param \App\Http\Requests\Auth\RefreshTokenRequest $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/refresh-token",
     *     tags={"Auth"},
     *     summary="Refresh Token",
     *     description="Obtain a new access token using a valid refresh token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"refresh_token"},
     *             @OA\Property(property="refresh_token", type="string", example="your-refresh-token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Refresh Token",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object", example="..."),
     *                 @OA\Property(property="access_token", type="string", example="1|w1BYT5mmAUSvNqFNnldp43RPH08DZ2cEiSi92QXG170d182a"),
     *                 @OA\Property(property="refresh_token", type="string", example="your-refresh-token"),
     *                 @OA\Property(property="type", type="string", example="Bearer")
     *             )
     *         )
     *     ),
     * )
     */
    public function refreshToken(RefreshTokenRequest $request)
    {
        $data = $this->service->refreshToken($request);
        return $this->response($data);
    }

    /**
     * Summary of logout
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Auth"},
     *     summary="Logout user",
     *     description="Logout the authenticated user",
     *     security={{"bearerAuth":{}}},
     * @OA\Parameter(
     *     name="platform",
     *     in="query",
     *     required=true,
     *     description="Platform to logout from (0 for web, 1 for mobile)",
     *     @OA\Schema(type="integer")
     * ),
     *     @OA\Response(
     *         response=200,
     *         description="Logout",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example={})
     *         )
     *     )
     * )
     */
    public function logout(Request $request)
    {
        $data = $this->service->logout($request);
        return $this->response($data);
    }

    /**
     * Summary of me
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Get(
     *     path="/api/me",
     *     tags={"Auth"},
     *     summary="Get authenticated user",
     *     description="Retrieve the authenticated user's information including wallet and places view limit",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Authenticated user information",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="gender", type="string", nullable=true, example="male"),
     *                 @OA\Property(property="phone_number", type="string", nullable=true, example="0123456789"),
     *                 @OA\Property(property="role", type="string", nullable=true, example="user"),
     *                 @OA\Property(property="avatar", type="string", nullable=true),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_blocked", type="boolean", example=false),
     *                 @OA\Property(
     *                     property="wallet",
     *                     type="object",
     *                     nullable=true,
     *                     @OA\Property(property="points", type="integer", example=1000),
     *                     @OA\Property(property="level", type="integer", example=5),
     *                     @OA\Property(property="total_earned", type="integer", example=5000),
     *                     @OA\Property(property="total_spent", type="integer", example=4000)
     *                 ),
     *                 @OA\Property(property="is_limit", type="boolean", example=true, description="true if user has places view limit, false if unlimited"),
     *                 @OA\Property(property="places_limit", type="integer", nullable=true, example=15, description="Number of places user can view, or null for unlimited"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     )
     * )
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('wallet');
        return $this->response(new UserResource($user));
    }

    /**
     * Update authenticated user's profile
     *
     * @OA\Put(
     *     path="/api/me",
     *     tags={"Auth"},
     *     summary="Update authenticated user profile",
     *     description="Update the authenticated user's profile information (name, phone_number, gender, avatar). Avatar can be uploaded as multipart/form-data.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="phone_number", type="string", example="0123456789"),
     *                 @OA\Property(property="gender", type="string", example="male", nullable=true, enum={"male", "female", "other"}),
     *                 @OA\Property(property="avatar", type="string", format="binary", description="Profile avatar image (JPEG, PNG, WebP, GIF, max 10MB)"),
     *                 @OA\Property(property="avatar_url", type="string", example="https://res.cloudinary.com/.../avatar.jpg", description="Avatar URL (uploaded to Cloudinary by client)")
     *             )
     *         ),
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="phone_number", type="string", example="0123456789"),
     *                 @OA\Property(property="gender", type="string", example="male", nullable=true, enum={"male", "female", "other"}),
     *                 @OA\Property(property="avatar_url", type="string", example="https://res.cloudinary.com/.../avatar.jpg", description="Avatar URL (uploaded to Cloudinary by client)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function updateMe(Request $request)
    {
        $user = $request->user();

        // Validation rules
        $rules = [
            'name' => 'sometimes|string|min:2|max:200',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|nullable|string|max:20',
            'gender' => 'sometimes|nullable|string|in:male,female,other',
            'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max (legacy/web)
            'avatar_url' => 'sometimes|nullable|url|max:2048', // Cloudinary URL (mobile - recommended)
        ];

        $validated = $request->validate($rules);

        // Priority: avatar_url (mobile) > avatar file (web/legacy)
        if ($request->filled('avatar_url')) {
            // Mobile client uploaded to Cloudinary
            $validated['avatar'] = $request->input('avatar_url');
            unset($validated['avatar_url']);
        } elseif ($request->hasFile('avatar')) {
            // Legacy file upload (web admin)
            $mediaService = app(\App\Services\MediaService::class);
            $uploadResult = $mediaService->uploadImage(
                $request->file('avatar'),
                'avatars'
            );
            $validated['avatar'] = $uploadResult['url'];
        }

        // Use UserService to handle update logic
        $updated = app(\App\Services\UserService::class)->updateUser(new Request($validated), $user);

        return $this->response($updated, 'Profile updated successfully');
    }

    /**
     * Update authenticated user's avatar
     *
     * @OA\Post(
     *     path="/api/me/avatar",
     *     tags={"Auth"},
     *     summary="Update user avatar",
     *     description="Upload and update the authenticated user's profile avatar image. The old avatar will be replaced.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="avatar",
     *                     type="string",
     *                     format="binary",
     *                     description="Profile avatar image (JPEG, PNG, WebP, GIF, max 10MB) - Legacy/Web only"
     *                 ),
     *                 @OA\Property(
     *                     property="avatar_url",
     *                     type="string",
     *                     example="https://res.cloudinary.com/.../avatar.jpg",
     *                     description="Avatar URL (uploaded to Cloudinary by client) - Mobile recommended"
     *                 )       )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Avatar updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Avatar updated successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="avatar", type="string", example="https://res.cloudinary.com/.../avatars/abc123.jpg"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        // Debug: Log request data
        Log::info('Avatar upload request', [
            'has_file' => $request->hasFile('avatar'),
            'all_files' => array_keys($request->allFiles()),
            'content_type' => $request->header('Content-Type'),
            'request_keys' => array_keys($request->all()),
        ]);

        // Validate: either avatar_url (mobile) or avatar file (web)
        $validated = $request->validate([
            'avatar' => 'sometimes|required_without:avatar_url|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'avatar_url' => 'sometimes|required_without:avatar|url|max:2048',
        ]);

        try {
            $avatarUrl = null;

            // Priority: avatar_url (mobile) > avatar file (web)
            if ($request->filled('avatar_url')) {
                // Mobile: Use Cloudinary URL directly
                $avatarUrl = $request->input('avatar_url');
            } elseif ($request->hasFile('avatar')) {
                // Web/Legacy: Upload to Cloudinary
                $mediaService = app(\App\Services\MediaService::class);
                $uploadResult = $mediaService->uploadImage(
                    $request->file('avatar'),
                    'avatars'
                );
                $avatarUrl = $uploadResult['url'];
            } else {
                return $this->errorResponse(
                    'Either avatar file or avatar_url is required.',
                    null,
                    422
                );
            }

            // Update user avatar URL
            $user->avatar = $avatarUrl;
            $user->save();

            // Return updated user
            return $this->response(new UserResource($user->fresh()), 'Avatar updated successfully');
        } catch (\Exception $e) {
            Log::error('Avatar upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->errorResponse('Failed to upload avatar: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Summary of changePassword
     * @param \Illuminate\Http\Request $request
     * @return mixed|\Illuminate\Http\JsonResponse
     * @OA\Post(
     *     path="/api/change-password",
     *     tags={"Auth"},
     *     summary="Change Password",
     *     description="Change the authenticated user's password",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password", "new_password", "new_password_confirmation"},
     *             @OA\Property(property="current_password", type="string", example="current_password"),
     *             @OA\Property(property="new_password", type="string", example="new_password"),
     *             @OA\Property(property="new_password_confirmation", type="string", example="new_password_confirmation")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password changed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", example={})
     *         )
     *     )
     * )
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $data = $this->service->changePassword($request);
        return $this->response($data);
    }
}
