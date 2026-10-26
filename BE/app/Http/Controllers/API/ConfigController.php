<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ActivityGroupService;
use App\Services\ConfigService;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    protected $configService;
    protected $activityGroupService;

    public function __construct(
        ConfigService $configService,
        ActivityGroupService $activityGroupService
    ) {
        $this->configService = $configService;
        $this->activityGroupService = $activityGroupService;
    }

    /**
     * @OA\Get(
     *     path="/api/config",
     *     tags={"Config"},
     *     summary="Get application configuration",
     *     description="Returns all necessary configuration and data for app initialization. Public endpoint - no authentication required.",
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="app",
     *                     type="object",
     *                     @OA\Property(property="version", type="string", example="1.0.0"),
     *                     @OA\Property(property="min_version", type="string", example="1.0.0"),
     *                     @OA\Property(property="maintenance_mode", type="boolean", example=false)
     *                 ),
     *                 @OA\Property(
     *                     property="activity_groups",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string"),
     *                         @OA\Property(property="key", type="string")
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="limits",
     *                     type="object",
     *                     @OA\Property(property="places_view_limit_guest", type="integer", example=15),
     *                     @OA\Property(property="places_view_limit_user_no_posts", type="integer", example=15)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        // Get app settings
        $appVersion = $this->configService->get('app.version', '1.0.0');
        $minVersion = $this->configService->get('app.min_version', '1.0.0');
        $maintenanceMode = $this->configService->get('app.maintenance_mode', false);

        // Get activity groups with categories
        $activityGroups = $this->activityGroupService->all([])
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'key' => $group->key,
                    'is_active' => $group->is_active,
                ];
            });

        // Get limits
        $limits = [
            'places_view_limit_guest' => (int) $this->configService->get('limits.places_view_limit_guest', 15),
            'places_view_limit_user_no_posts' => (int) $this->configService->get('limits.places_view_limit_user_no_posts', 15),
        ];

        return $this->response([
            'app' => [
                'version' => $appVersion,
                'min_version' => $minVersion,
                'maintenance_mode' => (bool) $maintenanceMode,
            ],
            'activity_groups' => $activityGroups,
            'limits' => $limits,
        ]);
    }
}
