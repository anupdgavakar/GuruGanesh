<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brands\BrandRequest;
use App\Models\Brand;
use App\Services\ImageUploadService;

class BrandController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        $query = Brand::query();

        // Brand has a status toggle (like sliders/services/testimonials) but
        // this endpoint previously ignored it entirely, showing disabled
        // brands to every visitor. Same opt-in pattern as elsewhere: hidden
        // from the public by default, visible to admin/staff via
        // ?include_inactive=1 so they can find and re-enable one.
        $canSeeInactive = request()->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeInactive || ! request()->boolean('include_inactive')) {
            $query->where('status', true);
        }

        return response()->json(['status' => 'success', 'data' => $query->get()]);
    }

    public function show(Brand $brand)
    {
        return response()->json(['status' => 'success', 'data' => $brand]);
    }

    public function store(BrandRequest $request)
    {
        $validated = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $this->uploads->store($request->file('logo'), 'brands');
        }

        $brand = Brand::create($validated);

        return response()->json(['status' => 'success', 'data' => $brand], 201);
    }

    public function update(BrandRequest $request, Brand $brand)
    {
        $validated = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            $this->uploads->delete($brand->logo_path);
            $validated['logo_path'] = $this->uploads->store($request->file('logo'), 'brands');
        }

        $brand->update($validated);

        return response()->json(['status' => 'success', 'data' => $brand->fresh()]);
    }

    public function destroy(Brand $brand)
    {
        $this->uploads->delete($brand->logo_path);
        $brand->delete();

        return response()->json(['status' => 'success', 'message' => 'Brand deleted.']);
    }
}
