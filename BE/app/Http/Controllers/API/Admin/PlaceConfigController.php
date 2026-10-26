<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\ConfigService;
use Illuminate\Http\Request;

class PlaceConfigController extends Controller
{
    protected ConfigService $configService;

    public function __construct(ConfigService $configService)
    {
        $this->configService = $configService;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/place-config/auto-approve",
     *     tags={"Admin - Place Config"},
     *     summary="Get auto-approve setting",
     *     description="Get current auto-approve places setting",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="auto_approve", type="boolean", example=true)
     *             )
     *         )
     *     )
     * )
     */
    public function getAutoApprove()
    {
        $autoApprove = $this->configService->get('places.auto_approve', false);

        return $this->response([
            'auto_approve' => filter_var($autoApprove, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $autoApprove,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/place-config/auto-approve/toggle",
     *     tags={"Admin - Place Config"},
     *     summary="Toggle auto-approve places",
     *     description="Enable or disable auto-approve for all places",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="enabled", type="boolean", example=true, description="Optional: explicitly set enabled/disabled. If not provided, will toggle current value")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Auto-approve setting updated successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="auto_approve", type="boolean", example=true)
     *             )
     *         )
     *     )
     * )
     */
    public function toggleAutoApprove(Request $request)
    {
        $currentValue = (bool) $this->configService->get('places.auto_approve', false);

        $newValue = !$currentValue;

        $this->configService->set(
            'places.auto_approve', 
            $newValue, 
            'boolean', 
            'places', 
            'Auto-approve all places when created'
        );

        return $this->response([
            'auto_approve' => $newValue,
        ], 'Auto-approve setting updated successfully');
    }
}

