<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Announcement\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/announcements",
     *     tags={"Announcements"},
     *     summary="Get active announcements (Public)",
     *     description="Public endpoint to get list of active announcements ordered by priority. No authentication required. Only returns announcements that are currently within their time range (start_at <= now <= end_at, or null means no limit)",
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         required=false,
     *         description="Filter by type: banner, popup, text",
     *         @OA\Schema(type="string", enum={"banner", "popup", "text"})
     *     ),
     *     @OA\Parameter(
     *         name="position",
     *         in="query",
     *         required=false,
     *         description="Filter by position: home",
     *         @OA\Schema(type="string", enum={"home"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Announcement::active()->orderedByPriority();

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('position')) {
            $query->where('position', $request->input('position'));
        }

        $announcements = $query->get();

        return $this->response(AnnouncementResource::collection($announcements));
    }
}
