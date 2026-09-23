<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DesignModes\DesignModeRequest;
use App\Models\ProductDesignMode;

class ProductDesignModeController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ProductDesignMode::all()]);
    }

    public function show(ProductDesignMode $designMode)
    {
        return response()->json(['status' => 'success', 'data' => $designMode]);
    }

    public function store(DesignModeRequest $request)
    {
        $designMode = ProductDesignMode::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $designMode], 201);
    }

    public function update(DesignModeRequest $request, ProductDesignMode $designMode)
    {
        $designMode->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $designMode->fresh()]);
    }

    public function destroy(ProductDesignMode $designMode)
    {
        $designMode->delete();

        return response()->json(['status' => 'success', 'message' => 'Design mode deleted.']);
    }
}
