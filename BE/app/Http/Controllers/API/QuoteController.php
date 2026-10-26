<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Quote\QuoteResource;
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
     * Return a random quote of a given type.
     *
     * @param string $type   Quote type (must match QuoteTypeEnum values)
     * @param Request $request Optional query param `language` (default 'vi')
     */
    public function show(string $type, Request $request)
    {
        $language = $request->input('language', 'vi');
        $quote = $this->service->getRandom($type, $language);
        if (!$quote) {
            return $this->response(null, 'No quote found', 404);
        }
        return $this->response(new QuoteResource($quote));
    }
}
?>
