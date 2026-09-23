<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\StoreMediaRequest;
use App\Http\Requests\Media\UpdateMediaRequest;
use App\Models\Media;
use App\Services\ImageUploadService;

class MediaController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        return response()->json(['status' => 'success', 'data' => Media::all()]);
    }

    public function show(Media $media)
    {
        return response()->json(['status' => 'success', 'data' => $media]);
    }

    public function store(StoreMediaRequest $request)
    {
        $validated = $request->safe()->except('file');
        $validated['path'] = $this->uploads->store($request->file('file'), 'media');

        $media = Media::create($validated);

        return response()->json(['status' => 'success', 'data' => $media], 201);
    }

    public function update(UpdateMediaRequest $request, Media $media)
    {
        $validated = $request->safe()->except('file');

        if ($request->hasFile('file')) {
            $this->uploads->delete($media->path);
            $validated['path'] = $this->uploads->store($request->file('file'), 'media');
        }

        $media->update($validated);

        return response()->json(['status' => 'success', 'data' => $media->fresh()]);
    }

    public function destroy(Media $media)
    {
        $this->uploads->delete($media->path);
        $media->delete();

        return response()->json(['status' => 'success', 'message' => 'Media deleted.']);
    }
}
