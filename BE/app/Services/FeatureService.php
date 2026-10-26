<?php

namespace App\Services;

use App\Models\User;

class FeatureService
{
    /**
     * Feature definitions
     * Format: 'feature_name' => ['allowed', 'tiers']
     */
    protected array $features = [
        // Plan features
        'advanced_plan_generation' => ['pro', 'enterprise'],
        'unlimited_plans' => ['pro', 'enterprise'],
        'plan_export_pdf' => ['pro', 'enterprise'],
        
        // Analytics features
        'analytics_insights' => ['pro', 'enterprise'],
        'analytics_export' => ['enterprise'],
        
        // Place features
        'unlimited_place_views' => ['pro', 'enterprise'],
        'place_recommendations_ai' => ['enterprise'],
        
        // API access
        'api_access_unlimited' => ['enterprise'],
        'priority_support' => ['pro', 'enterprise'],
    ];

    /**
     * Check if user has access to a specific feature
     */
    public function hasAccess(User $user, string $feature): bool
    {
        // Feature doesn't exist - deny by default
        if (!isset($this->features[$feature])) {
            return false;
        }

        // Check if user's tier is in allowed tiers
        return in_array($user->subscription_tier, $this->features[$feature]);
    }

    /**
     * Get all available features for a user
     */
    public function getAvailableFeatures(User $user): array
    {
        $available = [];
        
        foreach ($this->features as $feature => $tiers) {
            if (in_array($user->subscription_tier, $tiers)) {
                $available[] = $feature;
            }
        }
        
        return $available;
    }

    /**
     * Get minimum required tier for a feature
     * Returns null if user already has access
     */
    public function requiresUpgrade(User $user, string $feature): ?string
    {
        if ($this->hasAccess($user, $feature)) {
            return null;
        }

        // Return minimum required tier
        return $this->features[$feature][0] ?? null;
    }

    /**
     * Get all features grouped by tier
     */
    public function getFeaturesByTier(): array
    {
        $byTier = [
            'free' => [],
            'pro' => [],
            'enterprise' => []
        ];

        foreach ($this->features as $feature => $tiers) {
            foreach ($tiers as $tier) {
                $byTier[$tier][] = $feature;
            }
        }

        return $byTier;
    }

    /**
     * Check if a feature exists
     */
    public function featureExists(string $feature): bool
    {
        return isset($this->features[$feature]);
    }
}
