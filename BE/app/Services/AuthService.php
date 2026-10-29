<?php

namespace App\Services;

use App\Enums\GenderEnum;
use App\Enums\PlatformEnum;
use App\Enums\RoleEnum;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Resources\Auth\LoginResource;
use App\Http\Resources\Classes\ClassesResource;
use App\Http\Resources\User\UserResource;
use App\Models\Wallet;
use App\Repositories\ScoreRepository;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AuthService extends BaseService
{
    protected $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Summary of login
     * @param mixed $request
     * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
     * @return LoginResource
     */
    public function login($request)
    {
        $credentials = $request->only('email', 'password');
        $user = $this->repository->findBy('email', $credentials['email']);
        if (!$user || !password_verify($credentials['password'], $user->password)) {
            throw new BadRequestHttpException(INVALID_CREDENTIALS_MESSAGE);
        }

        if ($user->is_blocked) {
            throw new BadRequestHttpException('Tài khoản của bạn đã bị khóa.');
        }
        // if (
        //     ($user->role === 'user' && $request->platform != PlatformEnum::MOBILE->value) ||
        //     ($user->role === 'admin' && $request->platform != PlatformEnum::WEB->value)
        // ) {
        //     throw new BadRequestHttpException(FORBIDDEN_MESSAGE);
        // }

        // $user->tokens()->delete(); // Allow multiple devices
        $token = $user->createToken('auth_token')->plainTextToken;
        $lastToken = $user->tokens()->first();
        $lastToken->update([
            'expires_at' => Carbon::now()->addSeconds(intval(config('app.token.access_token_expire'))),
        ]);
        $refreshToken = hash('sha256', Str::random(64));
        $user->update([
            'refresh_token' => $refreshToken,
            'refresh_token_expires_at' => Carbon::now()->addSeconds(intval(config('app.token.refresh_token_expire'))),
        ]);
        $user->load('wallet');
        $data = new LoginResource([
            'user' => $user,
            'access_token' => $token,
            'refresh_token' => $refreshToken,
        ]);
        return $data;
    }

    /**
     * Summary of loginAdmin
     * @param mixed $request
     * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
     * @return LoginResource
     */
    public function loginAdmin($request)
    {
        $credentials = $request->only('email', 'password');
        $user = $this->repository->findBy('email', $credentials['email']);
        if (!$user || !password_verify($credentials['password'], $user->password)) {
            throw new BadRequestHttpException(INVALID_CREDENTIALS_MESSAGE);
        }

        if ($user->is_blocked) {
            throw new BadRequestHttpException('Tài khoản của bạn đã bị khóa.');
        }

        if ($user->role !== 'admin') {
            throw new BadRequestHttpException(FORBIDDEN_MESSAGE);
        }

        // $user->tokens()->delete(); // Allow multiple devices
        $token = $user->createToken('admin_auth_token')->plainTextToken;
        $lastToken = $user->tokens()->first();
        $lastToken->update([
            'expires_at' => Carbon::now()->addSeconds(intval(config('app.token.access_token_expire'))),
        ]);
        $refreshToken = hash('sha256', Str::random(64));
        $user->update([
            'refresh_token' => $refreshToken,
            'refresh_token_expires_at' => Carbon::now()->addSeconds(intval(config('app.token.refresh_token_expire'))),
        ]);
        
        $data = new LoginResource([
            'user' => $user,
            'access_token' => $token,
            'refresh_token' => $refreshToken,
        ]);
        return $data;
    }

    /**
     * Summary of refreshToken
     * @param mixed $request
     * @throws \Illuminate\Auth\AuthenticationException
     * @return LoginResource
     */
    public function refreshToken($request)
    {
        $user = $this->repository->findBy('refresh_token', $request->refresh_token);
        if (!$user) {
            throw new AuthenticationException(UNAUTHORIZED_MESSAGE);
        }
        if ($user->refresh_token_expires_at && $user->refresh_token_expires_at < Carbon::now()) {
            throw new AuthenticationException(TOKEN_EXPIRED_MESSAGE);
        }
        // $user->tokens()->delete(); // Allow multiple devices
        $token = $user->createToken('auth_token')->plainTextToken;
        $lastToken = $user->tokens()->first();
        $lastToken->update([
            'expires_at' => Carbon::now()->addSeconds(intval(config('app.token.access_token_expire'))),
        ]);
        $user->load('wallet');
        $data = new LoginResource([
            'user' => $user,
            'access_token' => $token,
            'refresh_token' => $user->refresh_token
        ]);
        return $data;
    }

    /**
     * Summary of logout
     * @param mixed $request
     * @return array
     */
    public function logout($request)
    {
        $user = $request->user();
        $user->update([
            'refresh_token' => null,
            'refresh_token_expires_at' => null,
        ]);
        // $user->tokens()->delete(); // Allow multiple devices
        $data = [];
        return $data;
    }

    /**
     * Summary of changePassword
     * @param mixed $request
     * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
     * @return UserResource
     */
    public function changePassword($request)
    {
        $user = $request->user();
        $currentPassword = $request->current_password;
        if (!Hash::check($currentPassword, $user->password)) {
            throw new BadRequestHttpException(CURRENT_PASSWORD_INVALID_MESSAGE);
        }
        $newPassword = $request->new_password;
        if ($newPassword !== $request->new_password_confirmation) {
            throw new BadRequestHttpException(PASSWORD_MISMATCH_MESSAGE);
        }
        $user->update([
            'password' => Hash::make($newPassword),
            'hashed_password' => Hash::make($newPassword) // For Laravel auth compatibility
        ]);
        $data = new UserResource($user);
        return $data;
    }

    /**
     * Summary of register
     * @param mixed $request
     * @throws \Symfony\Component\HttpKernel\Exception\BadRequestHttpException
     * @return LoginResource
     */
    public function register($request)
    {
        return DB::transaction(function () use ($request) {
            // Create user
            $user = $this->repository->create([
                'username' => $request->email, // Use email as username
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'hashed_password' => Hash::make($request->password), // For Laravel auth compatibility
                'name' => $request->name,
                'phone_number' => $request->phone_number,
                'role' => $request->role ?? 'user', // Use requested role or default to user
                'gender' => 'other', // Default gender
            ]);

            // Create wallet for the user
            Wallet::create([
                'user_id' => $user->id,
                'points' => 0,
                'level' => 1,
                'total_earned' => 0,
                'total_spent' => 0,
            ]);

            // Generate tokens
            $token = $user->createToken('auth_token')->plainTextToken;
            $lastToken = $user->tokens()->first();
            $lastToken->update([
                'expires_at' => Carbon::now()->addSeconds(intval(config('app.token.access_token_expire'))),
            ]);
            
            $refreshToken = hash('sha256', Str::random(64));
            $user->update([
                'refresh_token' => $refreshToken,
                'refresh_token_expires_at' => Carbon::now()->addSeconds(intval(config('app.token.refresh_token_expire'))),
            ]);

            $user->load('wallet');
            $data = new LoginResource([
                'user' => $user,
                'access_token' => $token,
                'refresh_token' => $refreshToken,
            ]);

            return $data;
        });
    }

    /**
     * Summary of getTranscripts
     * @param mixed $data
     * @return array|array{gpa_10: float|int, gpa_4: float|int, rank: string, semesters: array, total_credits: float|int|array{gpa_10: float|int, gpa_4: float|int, rank: string, semesters: array, total_credits: int}}
     */

}
