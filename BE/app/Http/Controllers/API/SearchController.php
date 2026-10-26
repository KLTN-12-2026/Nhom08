<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search places using Scout/Meilisearch
     */
    public function searchPlaces(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:100',
            'limit' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $limit = $request->input('limit', 20);

        $places = Place::search($query)
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $places,
            'meta' => [
                'query' => $query,
                'count' => $places->count(),
                'total' => $places->count(),
            ],
        ]);
    }

    /**
     * Search categories using Scout/Meilisearch
     */
    public function searchCategories(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:100',
            'limit' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $limit = $request->input('limit', 20);

        $categories = Category::search($query)
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'meta' => [
                'query' => $query,
                'count' => $categories->count(),
                'total' => $categories->count(),
            ],
        ]);
    }

    /**
     * Search posts using Scout/Meilisearch
     */
    public function searchPosts(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:100',
            'limit' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $limit = $request->input('limit', 20);

        $posts = Post::search($query)
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts,
            'meta' => [
                'query' => $query,
                'count' => $posts->count(),
                'total' => $posts->count(),
            ],
        ]);
    }

    /**
     * Universal search - tìm trên tất cả models
     */
    public function searchAll(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:100',
            'limit' => 'integer|min:1|max:50',
        ]);

        $query = $request->input('query');
        $limit = $request->input('limit', 10);

        $places = Place::search($query)->take($limit)->get();
        $categories = Category::search($query)->take($limit)->get();
        $posts = Post::search($query)->take($limit)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'places' => $places,
                'categories' => $categories,
                'posts' => $posts,
            ],
            'meta' => [
                'query' => $query,
                'counts' => [
                    'places' => $places->count(),
                    'categories' => $categories->count(),
                    'posts' => $posts->count(),
                    'total' => $places->count() + $categories->count() + $posts->count(),
                ],
            ],
        ]);
    }
}
