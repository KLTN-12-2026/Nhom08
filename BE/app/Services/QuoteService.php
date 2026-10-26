<?php

namespace App\Services;

use App\Models\Quote;
use App\Repositories\QuoteRepository;

class QuoteService extends BaseService
{
    public function __construct(QuoteRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get a random quote based on type and language.
     */
    public function getRandom(string $type, string $language = 'vi'): ?Quote
    {
        $quote = $this->repository->findRandom([
            'type' => $type,
            'language' => $language,
        ]);

        if ($quote) {
            // Increment usage counters
            $quote->increment('usage_count');
            $quote->update(['last_used_at' => now()]);
        }

        return $quote;
    }

    /**
     * Create a new quote.
     */
    public function create(array $data): Quote
    {
        // Validation is handled in CreateQuoteRequest
        return $this->repository->create($data);
    }
}
