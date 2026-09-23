<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subcategories\SubcategoryRequest;
use App\Models\ProductSubcategory;
use Illuminate\Http\Request;

class ProductSubcategoryController extends Controller
{
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
        $subcategory = ProductSubcategory::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $subcategory], 201);
    }

    public function update(SubcategoryRequest $request, ProductSubcategory $subcategory)
    {
        $subcategory->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $subcategory->fresh()]);
    }

    public function destroy(ProductSubcategory $subcategory)
    {
        $subcategory->delete();

        return response()->json(['status' => 'success', 'message' => 'Subcategory deleted.']);
    }
}
