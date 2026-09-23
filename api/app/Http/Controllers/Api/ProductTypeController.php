<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductTypes\ProductTypeRequest;
use App\Models\ProductType;

class ProductTypeController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductType::all()]);
    }

    public function show(ProductType $productType)
    {
        return response()->json(['status' => 'success', 'data' => $productType]);
    }

    public function store(ProductTypeRequest $request)
    {
        $productType = ProductType::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $productType], 201);
    }

    public function update(ProductTypeRequest $request, ProductType $productType)
    {
        $productType->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $productType->fresh()]);
    }

    public function destroy(ProductType $productType)
    {
        $productType->delete();

        return response()->json(['status' => 'success', 'message' => 'Product type deleted.']);
    }
}
