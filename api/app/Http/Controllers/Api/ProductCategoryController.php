<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\CategoryRequest;
use App\Models\ProductCategory;

class ProductCategoryController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductCategory::with('subcategories')->get()]);
    }

    public function show(ProductCategory $category)
    {
        return response()->json(['status' => 'success', 'data' => $category->load('subcategories')]);
    }

    public function store(CategoryRequest $request)
    {
        $category = ProductCategory::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $category], 201);
    }

    public function update(CategoryRequest $request, ProductCategory $category)
    {
        $category->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $category->fresh()]);
    }

    public function destroy(ProductCategory $category)
    {
        $category->delete();

        return response()->json(['status' => 'success', 'message' => 'Category deleted.']);
    }
}
