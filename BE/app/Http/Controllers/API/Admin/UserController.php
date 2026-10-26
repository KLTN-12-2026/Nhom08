<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     tags={"Admin - Users"},
     *     summary="Get all users",
     *     description="Retrieve all users with pagination and filtering",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer", example="1")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         @OA\Schema(type="integer", example="10")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name or email",
     *         @OA\Schema(type="string", example="john")
     *     ),
     *     @OA\Parameter(
     *         name="role",
     *         in="query",
     *         description="Filter by role",
     *         @OA\Schema(type="string", example="user")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Users retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);
        $data = $this->service->getAllUsers($request);
        return $this->response($data);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users",
     *     tags={"Admin - Users"},
     *     summary="Create new user",
     *     description="Create a new user account",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password", "password_confirmation", "name"},
     *             @OA\Property(property="email", type="string", example="newuser@example.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", example="password123"),
     *             @OA\Property(property="name", type="string", example="New User"),
     *             @OA\Property(property="phone_number", type="string", example="0123456789"),
     *             @OA\Property(property="role", type="string", example="user", enum={"admin", "user"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User created successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(CreateUserRequest $request)
    {
        $this->authorize('create', User::class);
        $data = $this->service->createUser($request);
        return $this->response($data, "User created successfully", 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users/{user}",
     *     tags={"Admin - Users"},
     *     summary="Get user details",
     *     description="Retrieve detailed information about a specific user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer", example="1")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);
        $data = $this->service->getUserDetails($user);
        return $this->response($data);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{user}",
     *     tags={"Admin - Users"},
     *     summary="Update user",
     *     description="Update user information",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer", example="1")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Updated Name"),
     *             @OA\Property(property="phone_number", type="string", example="0987654321"),
     *             @OA\Property(property="role", type="string", example="user", enum={"admin", "user"}),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="is_blocked", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);
        $data = $this->service->updateUser($request, $user);
        return $this->response($data, "User updated successfully");
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/users/{user}",
     *     tags={"Admin - Users"},
     *     summary="Delete user",
     *     description="Delete a user account",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer", example="1")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User deleted successfully"),
     *             @OA\Property(property="data", type="object", example=null)
     *         )
     *     )
     * )
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $this->service->deleteUser($user);
        return $this->response(null, "User deleted successfully");
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users/{user}/block",
     *     tags={"Admin - Users"},
     *     summary="Block/Unblock user",
     *     description="Toggle user block status",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer", example="1")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User status updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User status updated"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function toggleBlock(User $user)
    {
        $this->authorize('block', $user);
        $data = $this->service->toggleUserBlock($user);
        return $this->response($data, "User status updated");
    }
}
