<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DesignFiles\DesignFileUploadRequest;
use App\Models\OrderItem;
use App\Services\DesignFileUploadService;

class DesignFileController extends Controller
{
    public function __construct(private DesignFileUploadService $uploads)
    {
    }

    /**
     * Public, rate-limited: uploads a customer's design file at cart time —
     * before any order exists. The cart itself only lives in the browser's
     * localStorage (see web's cart-context.tsx), which can't hold a raw
     * file, so the frontend uploads immediately on file selection and
     * stores just this response's path + filename on the cart line item.
     * That reference then rides along with the rest of the item when the
     * cart is submitted to POST /orders.
     */
    public function store(DesignFileUploadRequest $request)
    {
        $file = $request->file('file');
        $path = $this->uploads->store($file);

        return response()->json([
            'status' => 'success',
            'data' => [
                'design_reference' => $path,
                'design_original_filename' => $file->getClientOriginalName(),
            ],
        ], 201);
    }

    /**
     * Admin/staff only: streams a design file back down under its original
     * filename. Scoped to a real order item rather than an arbitrary path,
     * so a guessed/stale storage path can't be requested on its own — only
     * a file that's actually attached to a placed order is servable here.
     */
    public function download(OrderItem $item)
    {
        abort_unless($item->design_delivery_method === 'upload' && $item->design_reference, 404);
        abort_unless($this->uploads->exists($item->design_reference), 404);

        return $this->uploads->download($item->design_reference, $item->design_original_filename ?? 'design-file');
    }
}
