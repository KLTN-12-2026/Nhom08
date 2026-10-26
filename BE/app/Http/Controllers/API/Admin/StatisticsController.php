<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\StatisticsService;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    protected $service;

    public function __construct(StatisticsService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/statistics/users",
     *     tags={"Admin - Statistics"},
     *     summary="Get user statistics",
     *     description="Retrieve comprehensive user statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="days",
     *         in="query",
     *         description="Number of days for date range",
     *         @OA\Schema(type="integer", example="30")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function users(Request $request)
    {
        $data = $this->service->getUserStatistics($request);
        return $this->response($data);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/statistics/places",
     *     tags={"Admin - Statistics"},
     *     summary="Get place statistics",
     *     description="Retrieve comprehensive place statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="days",
     *         in="query",
     *         description="Number of days for date range",
     *         @OA\Schema(type="integer", example="30")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Place statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function places(Request $request)
    {
        $data = $this->service->getPlaceStatistics($request);
        return $this->response($data);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/statistics/transactions",
     *     tags={"Admin - Statistics"},
     *     summary="Get transaction statistics",
     *     description="Retrieve comprehensive transaction statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="days",
     *         in="query",
     *         description="Number of days for date range",
     *         @OA\Schema(type="integer", example="30")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Transaction statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function transactions(Request $request)
    {
        $data = $this->service->getTransactionStatistics($request);
        return $this->response($data);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/statistics/general",
     *     tags={"Admin - Statistics"},
     *     summary="Get general system statistics",
     *     description="Retrieve general system statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="General statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function general(Request $request)
    {
        $data = $this->service->getGeneralStatistics($request);
        return $this->response($data);
    }
}
