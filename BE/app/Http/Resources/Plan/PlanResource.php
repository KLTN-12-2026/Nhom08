<?php

namespace App\Http\Resources\Plan;

use App\Http\Resources\Place\PlaceResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="PlanResource",
 *     title="Plan Resource",
 *     description="Plan resource representation",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="budget_input", type="number", example=500000),
 *     @OA\Property(property="total_estimated", type="number", example=450000),
 *     @OA\Property(property="actual_cost", type="number", example=440000, nullable=true),
 *     @OA\Property(property="activities", type="array", @OA\Items(type="string"), example={"Eating", "Cinema"}),
 *     @OA\Property(property="places", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="place_count", type="integer", example=2),
 *     @OA\Property(property="is_within_budget", type="boolean", example=true),
 *     @OA\Property(property="budget_efficiency", type="number", format="float", example=90.5),
 *     @OA\Property(property="is_saved", type="boolean", example=true),
 *     @OA\Property(property="scheduled_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class PlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'budget_input' => $this->budget,
            'total_estimated' => $this->total_estimated,
            'actual_cost' => $this->actual_cost,
            'activities' => $this->activities,
            'places' => $this->when(
                $this->relationLoaded('placeDetails'),
                function () {
                    return PlaceResource::collection($this->placeDetails);
                },
                PlaceResource::collection($this->getPlaceDetailsAttribute())
            ),
            'place_count' => $this->place_count,
            'is_within_budget' => $this->is_within_budget,
            'budget_efficiency' => round($this->budget_efficiency, 2),
            'is_saved' => $this->is_saved,
            'scheduled_at' => $this->scheduled_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}