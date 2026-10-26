<?php

namespace App\Http\Controllers\API\Admin;

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
     * List all tickets (admin view)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Ticket::class);
        $tickets = $this->service->getAllTickets($request->all());
        return $this->response(TicketResource::collection($tickets));
    }

    /**
     * Show ticket detail
     */
    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);
        return $this->response(new TicketResource($ticket));
    }

    /**
     * Update ticket status (admin only)
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $this->authorize('update', $ticket);
        $validated = $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed',
        ]);
        $ticket = $this->service->updateStatus($ticket->id, $validated['status']);
        return $this->response(new TicketResource($ticket), 'Status updated');
    }

    /**
     * Assign ticket to admin
     */
    public function assign(Request $request, Ticket $ticket)
    {
        $this->authorize('assign', $ticket);
        $validated = $request->validate([
            'admin_id' => 'required|integer|exists:users,id',
        ]);
        $ticket = $this->service->assignAdmin($ticket->id, $validated['admin_id']);
        return $this->response(new TicketResource($ticket), 'Admin assigned');
    }

    /**
     * Delete ticket (admin only)
     */
    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);
        $this->service->delete($ticket->id);
        return $this->response(null, 'Ticket deleted');
    }
}
?>
