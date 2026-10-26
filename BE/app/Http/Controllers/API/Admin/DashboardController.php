<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $service;

    public function __construct(DashboardService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/dashboard",
     *     tags={"Admin - Dashboard"},
     *     summary="Get admin dashboard data",
     *     description="Retrieve comprehensive dashboard data for admin panel",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dashboard data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="overview", type="object"),
     *                 @OA\Property(property="recent_activity", type="array",
     *                     @OA\Items(type="object")
     *                 ),
     *                 @OA\Property(property="user_growth", type="array",
     *                     @OA\Items(type="object")
     *                 ),
     *                 @OA\Property(property="place_growth", type="array",
     *                     @OA\Items(type="object")
     *                 ),
     *                 @OA\Property(property="transaction_summary", type="object"),
     *                 @OA\Property(property="top_performers", type="object"),
     *                 @OA\Property(property="system_health", type="object")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $data = $this->service->getDashboardData($request);
        return $this->response($data);
    }
}
