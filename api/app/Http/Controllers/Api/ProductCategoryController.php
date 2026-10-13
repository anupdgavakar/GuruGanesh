<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\CategoryRequest;
use App\Models\ProductCategory;
use App\Services\ImageUploadService;

class ProductCategoryController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductCategory::with('subcategories')->orderBy('menu_order')->orderBy('id')->get()]);
    }

    public function show(ProductCategory $category)
    {
        return response()->json(['status' => 'success', 'data' => $category->load('subcategories')]);
    }

    public function store(CategoryRequest $request)
    {
        $validated = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'categories');
        }

        $category = ProductCategory::create($validated);

        return response()->json(['status' => 'success', 'data' => $category], 201);
    }

    public function update(CategoryRequest $request, ProductCategory $category)
    {
        $validated = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $this->uploads->delete($category->image_path);
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'categories');
        }

        $category->update($validated);

        return response()->json(['status' => 'success', 'data' => $category->fresh()]);
    }

    public function destroy(ProductCategory $category)
    {
        $this->uploads->delete($category->image_path);
        $category->delete();

        return response()->json(['status' => 'success', 'message' => 'Category deleted.']);
    }
}
