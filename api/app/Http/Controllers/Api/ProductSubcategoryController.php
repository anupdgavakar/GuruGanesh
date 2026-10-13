<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subcategories\SubcategoryRequest;
use App\Models\ProductSubcategory;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

class ProductSubcategoryController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    public function index(Request $request)
    {
        $query = ProductSubcategory::query()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        return response()->json(['status' => 'success', 'data' => $query->get()]);
    }

    public function show(ProductSubcategory $subcategory)
    {
        return response()->json(['status' => 'success', 'data' => $subcategory->load('category')]);
    }

    public function store(SubcategoryRequest $request)
    {
        $validated = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'subcategories');
        }

        $subcategory = ProductSubcategory::create($validated);

        return response()->json(['status' => 'success', 'data' => $subcategory], 201);
    }

    public function update(SubcategoryRequest $request, ProductSubcategory $subcategory)
    {
        $validated = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $this->uploads->delete($subcategory->image_path);
            $validated['image_path'] = $this->uploads->store($request->file('image'), 'subcategories');
        }

        $subcategory->update($validated);

        return response()->json(['status' => 'success', 'data' => $subcategory->fresh()]);
    }

    public function destroy(ProductSubcategory $subcategory)
    {
        $this->uploads->delete($subcategory->image_path);
        $subcategory->delete();

        return response()->json(['status' => 'success', 'message' => 'Subcategory deleted.']);
    }
}
