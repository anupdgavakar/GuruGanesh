<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Testimonials\TestimonialRequest;
use App\Models\Testimonial;
use App\Services\ImageUploadService;

class TestimonialController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        $query = Testimonial::query();

        // Same opt-in pattern as products/blogs/sliders — see ProductController::index.
        $canSeeInactive = request()->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeInactive || ! request()->boolean('include_inactive')) {
            $query->where('status', true);
        }

        return response()->json(['status' => 'success', 'data' => $query->get()]);
    }

    public function show(Testimonial $testimonial)
    {
        return response()->json(['status' => 'success', 'data' => $testimonial]);
    }

    public function store(TestimonialRequest $request)
    {
        $validated = $request->safe()->except('avatar');

        if ($request->hasFile('avatar')) {
            $validated['avatar_path'] = $this->uploads->store($request->file('avatar'), 'testimonials');
        }

        $testimonial = Testimonial::create($validated);

        return response()->json(['status' => 'success', 'data' => $testimonial], 201);
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial)
    {
        $validated = $request->safe()->except('avatar');

        if ($request->hasFile('avatar')) {
            $this->uploads->delete($testimonial->avatar_path);
            $validated['avatar_path'] = $this->uploads->store($request->file('avatar'), 'testimonials');
        }

        $testimonial->update($validated);

        return response()->json(['status' => 'success', 'data' => $testimonial->fresh()]);
    }

    public function destroy(Testimonial $testimonial)
    {
        $this->uploads->delete($testimonial->avatar_path);
        $testimonial->delete();

        return response()->json(['status' => 'success', 'message' => 'Testimonial deleted.']);
    }
}
