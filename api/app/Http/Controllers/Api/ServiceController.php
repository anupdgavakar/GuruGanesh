<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\ServiceRequest;
use App\Models\Service;
use App\Services\ImageUploadService;

class ServiceController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        $query = Service::query();

        // Same opt-in pattern as products/blogs/sliders — see ProductController::index.
        $canSeeInactive = request()->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeInactive || ! request()->boolean('include_inactive')) {
            $query->where('status', true);
        }

        return response()->json(['status' => 'success', 'data' => $query->get()]);
    }

    public function show(Service $service)
    {
        return response()->json(['status' => 'success', 'data' => $service]);
    }

    public function store(ServiceRequest $request)
    {
        $validated = $request->safe()->except(['icon', 'image']);

        if ($request->hasFile('icon')) {
            $validated['icon_path'] = $this->uploads->store($request->file('icon'), 'services/icons');
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'services/images');
        }

        $service = Service::create($validated);

        return response()->json(['status' => 'success', 'data' => $service], 201);
    }

    public function update(ServiceRequest $request, Service $service)
    {
        $validated = $request->safe()->except(['icon', 'image']);

        if ($request->hasFile('icon')) {
            $this->uploads->delete($service->icon_path);
            $validated['icon_path'] = $this->uploads->store($request->file('icon'), 'services/icons');
        }

        if ($request->hasFile('image')) {
            $this->uploads->delete($service->image_path);
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'services/images');
        }

        $service->update($validated);

        return response()->json(['status' => 'success', 'data' => $service->fresh()]);
    }

    public function destroy(Service $service)
    {
        $this->uploads->delete($service->icon_path);
        $this->uploads->delete($service->image_path);
        $service->delete();

        return response()->json(['status' => 'success', 'message' => 'Service deleted.']);
    }
}
