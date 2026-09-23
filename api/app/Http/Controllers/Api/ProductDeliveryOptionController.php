<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryOptions\DeliveryOptionRequest;
use App\Models\ProductDeliveryOption;

class ProductDeliveryOptionController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductDeliveryOption::all()]);
    }

    public function show(ProductDeliveryOption $deliveryOption)
    {
        return response()->json(['status' => 'success', 'data' => $deliveryOption]);
    }

    public function store(DeliveryOptionRequest $request)
    {
        $deliveryOption = ProductDeliveryOption::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $deliveryOption], 201);
    }

    public function update(DeliveryOptionRequest $request, ProductDeliveryOption $deliveryOption)
    {
        $deliveryOption->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $deliveryOption->fresh()]);
    }

    public function destroy(ProductDeliveryOption $deliveryOption)
    {
        $deliveryOption->delete();

        return response()->json(['status' => 'success', 'message' => 'Delivery option deleted.']);
    }
}
