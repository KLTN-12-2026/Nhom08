<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Quote\QuoteResource;
use App\Http\Resources\PaginationResource;
use App\Http\Requests\Quote\CreateQuoteRequest;
use App\Http\Requests\Quote\UpdateQuoteRequest;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    protected $service;

    public function __construct(QuoteService $service)
    {
        $this->service = $service;
    }

    /**
     * List all quotes (admin view).
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Quote::class);
        $data = $this->service->all($request);
        return $this->response(new PaginationResource(QuoteResource::collection($data)));
    }

    /**
     * Store a new quote.
     */
    public function store(CreateQuoteRequest $request)
    {
        $this->authorize('create', Quote::class);
        $quote = $this->service->create($request->validated());
        return $this->response(new QuoteResource($quote), 'Quote created successfully', 201);
    }

    /**
     * Show a quote.
     */
    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);
        return $this->response(new QuoteResource($quote));
    }

    /**
     * Update a quote.
     */
    public function update(UpdateQuoteRequest $request, Quote $quote)
    {
        $this->authorize('update', $quote);
        $quote->update($request->validated());
        return $this->response(new QuoteResource($quote), 'Quote updated successfully');
    }

    /**
     * Delete a quote (soft delete).
     */
    public function destroy(Quote $quote)
    {
        $this->authorize('delete', $quote);
        $quote->delete();
        return $this->response(null, 'Quote deleted successfully');
    }

    /**
     * Toggle active status.
     */
    public function toggle(Quote $quote)
    {
        $this->authorize('update', $quote);
        $quote->is_active = ! $quote->is_active;
        $quote->save();
        return $this->response(new QuoteResource($quote), 'Quote status toggled');
    }
}
?>
