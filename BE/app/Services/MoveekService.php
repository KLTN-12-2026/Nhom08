<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MoveekService
{
    public function fetchMovieDetail($slug)
    {
        try {
            $url = "https://moveek.com/phim/{$slug}/";
            
            $response = Http::withHeaders([
                'accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'user-agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return null;
            }

            $html = $response->body();
            $movie = $this->parseMovieDetail($html, $slug);
            
            if (!empty($movie)) {
                $movie['page_url'] = $url;
            }
            
            return $movie;
            
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseMovieDetail($html, $slug)
    {
        $movie = ['slug' => $slug];
        
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        
        // 1. Get Title
        $titleNode = $xpath->query('//h1')->item(0);
        if ($titleNode instanceof \DOMElement) {
            $movie['title'] = trim($titleNode->textContent);
        } else {
            $ogTitle = $xpath->query('//meta[@property="og:title"]')->item(0);
            if ($ogTitle instanceof \DOMElement) {
                $movie['title'] = $ogTitle->getAttribute('content');
            }
        }
        
        // 2. Get Poster
        $ogImage = $xpath->query('//meta[@property="og:image"]')->item(0);
        if ($ogImage instanceof \DOMElement) {
            $movie['poster'] = $ogImage->getAttribute('content');
        } else {
             // Fallback to finding img in featured section
             $img = $xpath->query('//div[contains(@class, "featured-movie")]//img')->item(0);
             if ($img instanceof \DOMElement) {
                 $movie['poster'] = $img->getAttribute('data-src') ?: $img->getAttribute('src');
             }
        }
        
        // 3. Get Description
        // Priority: Paragraph with text-justify in featured section, then meta description
        $descP = $xpath->query('//div[contains(@class, "featured-movie")]//p[contains(@class, "text-justify")]')->item(0);
        if ($descP instanceof \DOMElement) {
             $movie['description'] = trim($descP->textContent);
        } else {
            $descNode = $xpath->query('//meta[@name="description"]')->item(0);
            if ($descNode instanceof \DOMElement) {
                $movie['description'] = $descNode->getAttribute('content');
            }
        }
        
        // 4. Get Genres & Sub-text
        // Look for: <p class="mb-0 text-muted text-truncate">English Name - Genre</p>
        $subTextNode = $xpath->query('//div[contains(@class, "featured-movie")]//p[contains(@class, "text-muted") and contains(@class, "text-truncate")]')->item(0);
        if ($subTextNode instanceof \DOMElement) {
            $text = trim($subTextNode->textContent);
            // $text might be "Bloody Haven - Drama"
            $parts = explode('-', $text);
            if (count($parts) > 1) {
                $genres = array_map('trim', explode(',', end($parts)));
                $movie['genres'] = $genres;
            }
        }
        
        if (empty($movie['genres'])) {
             // Fallback to meta keywords if extraction failed
            $keywordsNode = $xpath->query('//meta[@name="keywords"]')->item(0);
            if ($keywordsNode instanceof \DOMElement) {
                $keywords = $keywordsNode->getAttribute('content');
                // Filter out common keywords that aren't genres if possible, or just use them
                $movie['genres'] = array_map('trim', explode(',', $keywords));
            }
        }
        
        // 5. Get Release Date & Rating from columns
        // Context: inside .featured-movie .row
        $featured = $xpath->query('//div[contains(@class, "featured-movie")]')->item(0);
        if ($featured instanceof \DOMElement) {
            
            // Release Date: Look for "Khởi chiếu" label
            // Structure: <strong>...Khởi chiếu...</strong><br/> <span>Date</span>
            $dateNodes = $xpath->query('.//div[contains(@class, "col")]//strong[contains(., "Khởi chiếu")]/following-sibling::span', $featured);
            if ($dateNodes->length > 0) {
                 $movie['release_date'] = trim($dateNodes->item(0)->textContent);
            }
            
            // Rating: Look for "Hài lòng" or distinct rating link
            $ratingLink = $xpath->query('.//div[contains(@class, "col")]//a[contains(@href, "/review/")]', $featured);
            if ($ratingLink->length > 0) {
                 $movie['rating'] = trim($ratingLink->item(0)->textContent);
            }
            
             // Moveek ID (from Like button)
            $likeBtn = $xpath->query('.//a[contains(@class, "btn-do-movie-like")]', $featured)->item(0);
            if ($likeBtn instanceof \DOMElement) {
                 $movie['moveek_id'] = (int) $likeBtn->getAttribute('data-id');
            }
        }

        // 6. Get Trailer URL
        $trailerNode = $xpath->query('//div[contains(@class, "js-video") and contains(@class, "youtube")]//iframe')->item(0);
        if ($trailerNode instanceof \DOMElement) {
            $movie['trailer_url'] = $trailerNode->getAttribute('src');
        }

        return $movie;
    }
}
