<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sliders\SliderRequest;
use App\Models\Slider;
use App\Services\ImageUploadService;

class SliderController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        $query = Slider::query()->orderBy('sort_order');

        // Same opt-in pattern as products/blogs: disabled sliders stay
        // hidden from the public homepage, but the admin panel needs to
        // list (and re-enable) them via ?include_inactive=1.
        $canSeeInactive = request()->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeInactive || ! request()->boolean('include_inactive')) {
            $query->where('status', true);
        }

        return response()->json(['status' => 'success', 'data' => $query->get()]);
    }

    public function show(Slider $slider)
    {
        return response()->json(['status' => 'success', 'data' => $slider]);
    }

    public function store(SliderRequest $request)
    {
        $validated = $request->safe()->except('image');
        $validated['image_path'] = $this->uploads->store($request->file('image'), 'sliders');

        $slider = Slider::create($validated);

        return response()->json(['status' => 'success', 'data' => $slider], 201);
    }

    public function update(SliderRequest $request, Slider $slider)
    {
        $validated = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $this->uploads->delete($slider->image_path);
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'sliders');
        }

        $slider->update($validated);

        return response()->json(['status' => 'success', 'data' => $slider->fresh()]);
    }

    public function destroy(Slider $slider)
    {
        $this->uploads->delete($slider->image_path);
        $slider->delete();

        return response()->json(['status' => 'success', 'message' => 'Slider deleted.']);
    }
}
