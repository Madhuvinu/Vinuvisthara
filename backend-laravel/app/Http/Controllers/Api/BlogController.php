<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = Blog::with('category')
            ->where('status', 'published');

        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $perPage = $request->get('limit', 10);
        $blogs = $query->orderBy('published_at', 'desc')->paginate($perPage);

        return response()->json([
            'blogs' => $blogs->items(),
            'count' => $blogs->total(),
            'pagination' => [
                'page' => $blogs->currentPage(),
                'limit' => $blogs->perPage(),
                'total' => $blogs->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $blog = Blog::with('category')
            ->where('status', 'published')
            ->findOrFail($id);

        // Increment views
        $blog->increment('views');

        return response()->json(['blog' => $blog]);
    }
}
