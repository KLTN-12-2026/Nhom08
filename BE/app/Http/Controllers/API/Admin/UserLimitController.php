<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\ConfigService;
use Illuminate\Http\Request;

class UserLimitController extends Controller
{
    protected ConfigService $configService;

    public function __construct(ConfigService $configService)
    {
        $this->configService = $configService;
    }

    /**
     * Get current user limits configuration (enabled/disabled).
     */
    public function show()
    {
        $enabled = $this->configService->get('user_limits.enabled', config('user_limits.enabled', true));

        return $this->response([
            'enabled' => filter_var($enabled, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $enabled,
        ]);
    }

    /**
     * Update user limits enabled flag (enable/disable limit feature).
     *
     * Request body:
     * {
     *   "enabled": true|false
     * }
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $enabled = (bool) $validated['enabled'];

        $this->configService->set(
            'user_limits.enabled',
            $enabled,
            'boolean',
            'user_limits',
            'Enable or disable user limits feature'
        );

        return $this->response([
            'enabled' => $enabled,
        ], 'User limits setting updated successfully');
    }
}


