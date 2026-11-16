<?php

namespace App\Policies;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PlanPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Plan $plan): bool
    {
        return $user->id === $plan->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(?User $user): bool
    {
        if (!$user) {
            return true;
        }

        // Admins and Premium users have unlimited plans
        if ($user->role === 'admin' || $user->subscription_tier === 'pro' || $user->subscription_tier === 'premium') {
            return true;
        }

        // Standard user limit (e.g., 20 plans)
        $count = Plan::where('user_id', $user->id)->count();
        return $count < 50;
    }

    /**
     * Determine whether the user can generate advanced plans.
     */
    public function generateAdvanced(User $user): bool
    {
        return $user->role === 'admin' || in_array($user->subscription_tier, ['pro', 'premium', 'diamond']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Plan $plan): bool
    {
        return $user->id === $plan->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Plan $plan): bool
    {
        return $user->id === $plan->user_id || $user->role === 'admin';
    }
}
