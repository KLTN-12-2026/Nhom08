<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Ticket\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    protected $service;

    public function __construct(TicketService $service)
    {
        $this->service = $service;
    }

    /**
     * @OA\Get(
     *     path="/api/tickets/types",
     *     tags={"Tickets"},
     *     summary="Get ticket types",
     *     description="Get all available ticket types for dropdown selection. Public endpoint.",
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="value", type="integer", example=0),
     *                     @OA\Property(property="label", type="string", example="Đề xuất tính năng mới"),
     *                     @OA\Property(property="icon", type="string", example="💡")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getTypes()
    {
        $types = array_map(function ($case) {
            return [
                'value' => $case->value,
                'label' => $case->label(),
                'icon' => $case->icon(),
            ];
        }, \App\Enums\TicketType::cases());

        return $this->response($types);
    }

    /**
     * @OA\Get(
     *     path="/api/tickets",
     *     tags={"Tickets"},
     *     summary="Get my tickets",
     *     description="Get all tickets created by authenticated user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         required=false,
     *         description="Filter by ticket type (0-4)",
     *         @OA\Schema(type="integer", enum={0, 1, 2, 3, 4})
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         required=false,
     *         description="Filter by status",
     *         @OA\Schema(type="string", enum={"open", "in_progress", "resolved", "closed"})
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
        $this->authorize('index', Ticket::class);
        
        $tickets = $this->service->getMyTickets($request->user()->id, $request->all());
        
        return $this->response(TicketResource::collection($tickets));
    }

    /**
     * @OA\Post(
     *     path="/api/tickets",
     *     tags={"Tickets"},
     *     summary="Create a new ticket",
     *     description="Submit a new ticket (feedback, bug report, feature request, etc.)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"subject", "description", "type"},
     *             @OA\Property(property="subject", type="string", example="App crashes on startup"),
     *             @OA\Property(property="description", type="string", example="Detail description..."),
     *             @OA\Property(
     *                 property="type",
     *                 type="integer",
     *                 enum={0, 1, 2, 3, 4},
     *                 example=1,
     *                 description="0: Feature, 1: Bug, 2: Complain, 3: Feedback, 4: Invite"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Ticket created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Ticket created successfully")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('create', Ticket::class);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|integer|in:0,1,2,3,4',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'open';

        $ticket = $this->service->create($validated);

        return $this->response(new TicketResource($ticket), 'Ticket created successfully', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/tickets/{id}",
     *     tags={"Tickets"},
     *     summary="Get ticket detail",
     *     description="Get detailed information about a specific ticket",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Ticket ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Success")
     *         )
     *     )
     * )
     */
    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);
        
        return $this->response(new TicketResource($ticket));
    }

    /**
     * @OA\Put(
     *     path="/api/tickets/{id}",
     *     tags={"Tickets"},
     *     summary="Update ticket",
     *     description="Update ticket (only if status is 'open')",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Ticket ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="subject", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="type", type="integer", enum={0, 1, 2, 3, 4})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ticket updated"
     *     )
     * )
     */
    public function update(Request $request, Ticket $ticket)
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'type' => 'sometimes|integer|in:0,1,2,3,4',
        ]);

        $ticket = $this->service->update($validated, $ticket->id);

        return $this->response(new TicketResource($ticket), 'Ticket updated successfully');
    }

    /**
     * @OA\Delete(
     *     path="/api/tickets/{id}",
     *     tags={"Tickets"},
     *     summary="Delete ticket",
     *     description="Delete a ticket (admin only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Ticket ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Ticket deleted"
     *     )
     * )
     */
    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);
        
        $this->service->delete($ticket->id);

        return $this->response(null, 'Ticket deleted successfully');
    }
}
