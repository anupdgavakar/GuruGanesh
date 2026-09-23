<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Blogs\BlogRequest;
use App\Models\Blog;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index(Request $request)
    {
        $query = Blog::query()->with('author');

        // Drafts are only visible to a logged-in admin/staff member explicitly
        // asking for them — an anonymous ?include_drafts=1 must not reveal
        // unpublished posts. Phase 5: staff manage content too, not just admin.
        $canSeeDrafts = $request->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeDrafts || ! $request->boolean('include_drafts')) {
            $query->where('status', true);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->latest('published_at')->paginate($request->integer('per_page', 12)),
        ]);
    }

    public function show(Blog $blog)
    {
        return response()->json(['status' => 'success', 'data' => $blog->load('author')]);
    }

    public function store(BlogRequest $request)
    {
        $validated = $request->safe()->except('thumbnail');
        $validated['author_id'] = $request->user()->id;

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $this->uploads->store($request->file('thumbnail'), 'blogs');
        }

        $blog = Blog::create($validated);

        return response()->json(['status' => 'success', 'data' => $blog], 201);
    }

    public function update(BlogRequest $request, Blog $blog)
    {
        $validated = $request->safe()->except('thumbnail');

        if ($request->hasFile('thumbnail')) {
            $this->uploads->delete($blog->thumbnail_path);
            $validated['thumbnail_path'] = $this->uploads->store($request->file('thumbnail'), 'blogs');
        }

        $blog->update($validated);

        return response()->json(['status' => 'success', 'data' => $blog->fresh()]);
    }

    public function destroy(Blog $blog)
    {
        $this->uploads->delete($blog->thumbnail_path);
        $blog->delete();

        return response()->json(['status' => 'success', 'message' => 'Blog deleted.']);
    }
}
