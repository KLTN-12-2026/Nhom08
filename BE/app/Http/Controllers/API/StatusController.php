<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppInfoResource;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    /**
     * Simple public endpoint to indicate API availability.
     *
     * @OA\Get(
     *     path="/api/is-active",
     *     tags={"System"},
     *     summary="Health check",
     *     description="Simple public endpoint to check if API is running.",
     *     @OA\Response(
     *         response=200,
     *         description="API is active",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="status", type="string", example="ok")
     *             )
     *         )
     *     )
     * )
     */
    public function isActive(): JsonResponse
    {
        return $this->response([
            'status' => 'ok',
        ]);
    }

    /**
     * Public endpoint to expose basic application information.
     *
     * This is safe to be public – only returns non-sensitive metadata
     * such as version, environment, and framework/runtime versions.
     *
     * @OA\Get(
     *     path="/api/app-info",
     *     tags={"System"},
     *     summary="Get public application information",
     *     description="Public endpoint that returns non-sensitive application metadata such as version, environment, and runtime versions.",
     *     @OA\Response(
     *         response=200,
     *         description="Application info",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="name", type="string", example="Trove"),
     *                 @OA\Property(property="version", type="string", example="1.2.3"),
     *                 @OA\Property(property="environment", type="string", example="production"),
     *                 @OA\Property(property="debug", type="boolean", example=false),
     *                 @OA\Property(property="php_version", type="string", example="8.2.12"),
     *                 @OA\Property(property="laravel_version", type="string", example="12.x")
     *             )
     *         )
     *     )
     * )
     */
    public function appInfo(): JsonResponse
    {
        $data = [
            'name'            => config('app.name'),
            'version'         => config('app.version', env('APP_VERSION', '1.0.0')),
            'environment'     => config('app.env'),
            'debug'           => config('app.debug'),
            'php_version'     => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];

        return $this->response(AppInfoResource::make($data));
    }
}


