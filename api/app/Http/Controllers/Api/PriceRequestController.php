<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inquiries\PriceRequestRequest;
use App\Models\ContactInquiry;
use App\Models\Product;

class PriceRequestController extends Controller
{
    /**
     * A signed-in customer asks for the price of a product. It lands in the
     * same admin inbox as contact-form messages (Inquiries), marked as a
     * price request and linked to the customer's account and the product.
     */
    public function store(PriceRequestRequest $request)
    {
        $user = $request->user();

        $product = Product::query()->where('status', true)->find($request->validated('product_id'));

        if (! $product) {
            return response()->json([
                'status' => 'error',
                'message' => 'That product is no longer available.',
                'errors' => ['product_id' => ['That product is no longer available.']],
            ], 422);
        }

        $quantity = (int) $request->validated('quantity');
        $notes = trim((string) $request->validated('notes'));

        $message = "Please share the price for {$quantity} × {$product->name}.";

        if ($notes !== '') {
            $message .= "\n\nNotes from the customer:\n{$notes}";
        }

        $inquiry = ContactInquiry::create([
            'name' => $user->name,
            'email' => $request->validated('email'),
            'phone' => $user->phone,
            'subject' => "Price request: {$product->name}",
            'message' => $message,
            'type' => 'price_request',
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Thanks — we've got your request and will contact you with the price.",
            'data' => ['id' => $inquiry->id],
        ], 201);
    }
}
