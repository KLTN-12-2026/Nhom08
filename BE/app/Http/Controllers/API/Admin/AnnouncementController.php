<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\CreateAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Http\Resources\Announcement\AnnouncementResource;
use App\Http\Resources\PaginationResource;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/announcements",
     *     tags={"Admin - Announcements"},
     *     summary="List announcements (Admin)",
     *     description="Get paginated list of all announcements - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         description="Search by title or content",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         required=false,
     *         description="Filter by type",
     *         @OA\Schema(type="string", enum={"banner", "popup", "text"})
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         required=false,
     *         description="Filter by status",
     *         @OA\Schema(type="string", enum={"active", "inactive"})
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         description="Items per page",
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         description="Page number",
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Announcement::class);

        $query = Announcement::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $query->orderBy('priority', 'desc')->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 10);
        $announcements = $query->paginate($perPage);

        return $this->response(new PaginationResource(AnnouncementResource::collection($announcements)));
    }

    /**
     * @OA\Post(
     *     path="/api/admin/announcements",
     *     tags={"Admin - Announcements"},
     *     summary="Create announcement (Admin)",
     *     description="Create a new announcement - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "content", "type", "position", "status"},
     *             @OA\Property(property="title", type="string", example="Thông báo quan trọng"),
     *             @OA\Property(property="content", type="string", example="Nội dung thông báo"),
     *             @OA\Property(property="type", type="string", enum={"banner", "popup", "text"}, example="banner"),
     *             @OA\Property(property="position", type="string", enum={"home"}, example="home"),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"}, example="active"),
     *             @OA\Property(property="priority", type="integer", example=1),
     *             @OA\Property(property="start_at", type="string", format="date-time", example="2024-12-26T00:00:00Z", nullable=true),
     *             @OA\Property(property="end_at", type="string", format="date-time", example="2024-12-31T23:59:59Z", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created"
     *     )
     * )
     */
    public function store(CreateAnnouncementRequest $request)
    {
        $this->authorize('create', Announcement::class);

        $announcement = Announcement::create($request->validated());

        return $this->response(
            new AnnouncementResource($announcement),
            'Announcement created successfully',
            201
        );
    }

    /**
     * @OA\Get(
     *     path="/api/admin/announcements/{id}",
     *     tags={"Admin - Announcements"},
     *     summary="Get announcement details (Admin)",
     *     description="Get detailed information about a specific announcement - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Announcement ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function show(Announcement $announcement)
    {
        $this->authorize('view', $announcement);

        return $this->response(new AnnouncementResource($announcement));
    }

    /**
     * @OA\Put(
     *     path="/api/admin/announcements/{id}",
     *     tags={"Admin - Announcements"},
     *     summary="Update announcement (Admin)",
     *     description="Update announcement information - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Announcement ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Thông báo đã cập nhật"),
     *             @OA\Property(property="content", type="string", example="Nội dung đã cập nhật"),
     *             @OA\Property(property="type", type="string", enum={"banner", "popup", "text"}),
     *             @OA\Property(property="position", type="string", enum={"home"}),
     *             @OA\Property(property="status", type="string", enum={"active", "inactive"}),
     *             @OA\Property(property="priority", type="integer"),
     *             @OA\Property(property="start_at", type="string", format="date-time", nullable=true),
     *             @OA\Property(property="end_at", type="string", format="date-time", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated"
     *     )
     * )
     */
    public function update(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        $this->authorize('update', $announcement);

        $announcement->update($request->validated());

        return $this->response(
            new AnnouncementResource($announcement),
            'Announcement updated successfully'
        );
    }

    /**
     * @OA\Delete(
     *     path="/api/admin/announcements/{id}",
     *     tags={"Admin - Announcements"},
     *     summary="Delete announcement (Admin)",
     *     description="Delete an announcement - Admin access",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Announcement ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Deleted"
     *     )
     * )
     */
    public function destroy(Announcement $announcement)
    {
        $this->authorize('delete', $announcement);

        $announcement->delete();

        return $this->response(null, 'Announcement deleted successfully');
    }
}
