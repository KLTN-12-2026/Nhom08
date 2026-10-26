<?php

namespace App\Services;

use App\Models\Config;
use Illuminate\Support\Facades\Cache;

class ConfigService
{
    protected $cachePrefix = 'config:';
    protected $cacheTtl = 3600; // 1 hour

    /**
     * Get config value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get(string $key, $default = null)
    {
        $cacheKey = $this->cachePrefix . $key;

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($key, $default) {
            $config = Config::active()
                ->where('key', $key)
                ->first();

            return $config ? $config->value : $default;
        });
    }

    /**
     * Get all configs by group
     *
     * @param string $group
     * @return array
     */
    public function getByGroup(string $group): array
    {
        $cacheKey = $this->cachePrefix . 'group:' . $group;

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($group) {
            return Config::active()
                ->byGroup($group)
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Set config value
     *
     * @param string $key
     * @param mixed $value
     * @param string $type
     * @param string $group
     * @param string|null $description
     * @return Config
     */
    public function set(
        string $key,
        $value,
        string $type = 'string',
        string $group = 'system',
        ?string $description = null
    ): Config {
        $config = Config::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
                'description' => $description,
                'is_active' => true,
            ]
        );

        // Clear cache
        $this->clearCache($key);
        $this->clearCache('group:' . $group);

        return $config;
    }

    /**
     * Delete config
     *
     * @param string $key
     * @return bool
     */
    public function delete(string $key): bool
    {
        $config = Config::where('key', $key)->first();

        if ($config) {
            $group = $config->group;
            $config->delete();

            // Clear cache
            $this->clearCache($key);
            $this->clearCache('group:' . $group);

            return true;
        }

        return false;
    }

    /**
     * Clear cache for a specific key
     *
     * @param string $key
     * @return void
     */
    public function clearCache(string $key): void
    {
        Cache::forget($this->cachePrefix . $key);
    }

    /**
     * Clear all config cache
     *
     * @return void
     */
    public function clearAllCache(): void
    {
        // Note: In production, you might want to use cache tags if supported
        Cache::flush();
    }

    /**
     * Get nested config value (e.g., "user_limits.places_view_limits.0")
     *
     * @param string $path Dot-separated path
     * @param mixed $default
     * @return mixed
     */
    public function getNested(string $path, $default = null)
    {
        $parts = explode('.', $path);
        $group = $parts[0] ?? null;

        if (!$group) {
            return $default;
        }

        $configs = $this->getByGroup($group);
        $value = $configs;

        // Navigate through nested structure
        foreach ($parts as $part) {
            if ($part === $group) {
                continue; // Skip the group part
            }

            if (is_array($value) && isset($value[$part])) {
                $value = $value[$part];
            } else {
                // Try to get by full key
                $fullKey = implode('.', array_slice($parts, 0, array_search($part, $parts) + 1));
                $value = $this->get($fullKey, $default);
                break;
            }
        }

        return $value ?? $default;
    }
}

