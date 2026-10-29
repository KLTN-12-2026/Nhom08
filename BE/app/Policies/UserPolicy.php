<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Phân quyền quản lý người dùng (Admin).
 * Laravel tự động map App\Policies\UserPolicy <-> App\Models\User.
 */
class UserPolicy
{
    protected function isAdmin(User $authUser): bool
    {
        return $authUser->role === 'admin';
    }

    public function viewAny(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function view(User $authUser, User $user): bool
    {
        return $this->isAdmin($authUser);
    }

    public function create(User $authUser): bool
    {
        return $this->isAdmin($authUser);
    }

    public function update(User $authUser, User $user): Response
    {
        if (!$this->isAdmin($authUser)) {
            return Response::deny('Bạn không có quyền cập nhật người dùng.');
        }

        // Không cho admin tự hạ quyền / tự chặn chính mình
        if ($authUser->id === $user->id) {
            $request = request();
            if ($request->has('role') && $request->input('role') !== 'admin') {
                return Response::deny('Bạn không thể tự thay đổi vai trò của chính mình.');
            }
            if ($request->boolean('is_blocked')) {
                return Response::deny('Bạn không thể tự chặn chính mình.');
            }
        }

        return Response::allow();
    }

    public function delete(User $authUser, User $user): Response
    {
        if (!$this->isAdmin($authUser)) {
            return Response::deny('Bạn không có quyền xóa người dùng.');
        }

        if ($authUser->id === $user->id) {
            return Response::deny('Bạn không thể xóa chính mình.');
        }

        return Response::allow();
    }

    public function block(User $authUser, User $user): Response
    {
        if (!$this->isAdmin($authUser)) {
            return Response::deny('Bạn không có quyền chặn người dùng.');
        }

        if ($authUser->id === $user->id) {
            return Response::deny('Bạn không thể tự chặn chính mình.');
        }

        return Response::allow();
    }
}

