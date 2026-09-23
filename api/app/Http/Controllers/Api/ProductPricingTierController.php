<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PricingTiers\PricingTierRequest;
use App\Models\ProductPricingTier;

class ProductPricingTierController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductPricingTier::all()]);
    }

    public function show(ProductPricingTier $pricingTier)
    {
        return response()->json(['status' => 'success', 'data' => $pricingTier]);
    }

    public function store(PricingTierRequest $request)
    {
        $pricingTier = ProductPricingTier::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $pricingTier], 201);
    }

    public function update(PricingTierRequest $request, ProductPricingTier $pricingTier)
    {
        $pricingTier->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $pricingTier->fresh()]);
    }

    public function destroy(ProductPricingTier $pricingTier)
    {
        $pricingTier->delete();

        return response()->json(['status' => 'success', 'message' => 'Pricing tier deleted.']);
    }
}
