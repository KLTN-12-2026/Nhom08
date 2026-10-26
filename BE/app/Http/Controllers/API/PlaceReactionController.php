<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlaceReaction\TogglePlaceReactionRequest;
use App\Http\Resources\PlaceReaction\PlaceReactionResource;
use App\Http\Resources\PlaceReaction\PlaceReactionStatsResource;
use App\Models\Place;
use App\Models\PlaceReaction;
use App\Services\PlaceReactionService;
use App\Enums\ReactionType;

class PlaceReactionController extends Controller
{
    protected $service;

    public function __construct(PlaceReactionService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Post(
     *     path="/api/places/{placeId}/reactions",
     *     tags={"Place Reactions"},
     *     summary="Toggle user's reaction to a place",
     *     description="Create, update, or remove user's reaction. If same reaction type is sent again, it will be removed (toggle off).",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reaction_type"},
     *             @OA\Property(property="reaction_type", type="integer", enum={0, 1, 2}, example=2, description="0=Bad, 1=Normal, 2=Good")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Reaction toggled successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function toggle(TogglePlaceReactionRequest $request, $placeId)
    {
        $place = Place::findOrFail($placeId);
        $this->authorize('reactToPlace', [PlaceReaction::class, $place]);

        $reactionType = ReactionType::from($request->input('reaction_type'));
        $reaction = $this->service->toggleReaction(
            $request->user()->id,
            $placeId,
            $reactionType
        );

        if ($reaction === null) {
            return $this->response(
                null,
                message: 'Reaction removed successfully'
            );
        }

        return $this->response(
            new PlaceReactionResource($reaction),
            message: 'Reaction toggled successfully'
        );
    }

    /**
     * @OA\Get(
     *     path="/api/places/{placeId}/reactions/stats",
     *     tags={"Place Reactions"},
     *     summary="Get reaction statistics for a place",
     *     description="Get reaction counts, percentages, and current user's reaction (if authenticated)",
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="place_id", type="integer", example=1),
     *                 @OA\Property(property="total_reactions", type="integer", example=150),
     *                 @OA\Property(property="bad_count", type="integer", example=10),
     *                 @OA\Property(property="normal_count", type="integer", example=40),
     *                 @OA\Property(property="good_count", type="integer", example=100),
     *                 @OA\Property(property="bad_percentage", type="number", example=6.67),
     *                 @OA\Property(property="normal_percentage", type="number", example=26.67),
     *                 @OA\Property(property="good_percentage", type="number", example=66.67),
     *                 @OA\Property(property="my_reaction", type="integer", nullable=true, example=2)
     *             )
     *         )
     *     )
     * )
     */
    public function stats(\Illuminate\Http\Request $request, $placeId)
    {
        $this->authorize('index', PlaceReaction::class);
        
        $userId = $request->user()?->id;
        $stats = $this->service->getPlaceStats($placeId, $userId);

        return $this->response(new PlaceReactionStatsResource($stats));
    }

    /**
     * @OA\Get(
     *     path="/api/places/{placeId}/reactions/my-reaction",
     *     tags={"Place Reactions"},
     *     summary="Get current user's reaction for a place",
     *     description="Get the authenticated user's current reaction for a specific place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(property="data", type="object", nullable=true)
     *         )
     *     )
     * )
     */
    public function myReaction(\Illuminate\Http\Request $request, $placeId)
    {
        $this->authorize('create', PlaceReaction::class);

        $reaction = $this->service->getMyReaction($request->user()->id, $placeId);

        if (!$reaction) {
            return $this->response(null, message: 'No reaction found');
        }

        return $this->response(new PlaceReactionResource($reaction));
    }

    /**
     * @OA\Delete(
     *     path="/api/places/{placeId}/reactions",
     *     tags={"Place Reactions"},
     *     summary="Remove user's reaction from a place",
     *     description="Delete the authenticated user's reaction for a specific place",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="placeId",
     *         in="path",
     *         required=true,
     *         description="Place ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Reaction removed successfully")
     *         )
     *     )
     * )
     */
    public function destroy(\Illuminate\Http\Request $request, $placeId)
    {
        $reaction = PlaceReaction::where('user_id', $request->user()->id)
            ->where('place_id', $placeId)
            ->first();

        if (!$reaction) {
            return $this->response(null, message: 'No reaction found', statusCode: 404);
        }

        $this->authorize('destroy', $reaction);
        
        $this->service->deleteReaction($request->user()->id, $placeId);

        return $this->response(null, message: 'Reaction removed successfully');
    }
}
