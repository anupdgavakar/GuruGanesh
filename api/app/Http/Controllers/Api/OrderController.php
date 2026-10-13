<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\OrderRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Submit an order (cart -> checkout, no payment gateway — see
     * OrderRequest). Requires a logged-in customer (auth:sanctum +
     * role:customer on the route), so it's tied to $request->user(). Every
     * price is recomputed here from the product's own base_price; the
     * client only ever supplies product_id + quantity.
     */
    public function store(OrderRequest $request)
    {
        $items = collect($request->validated('items'));

        // Load every referenced product in one query, keyed by id, so the
        // loop below never touches the database inside a transaction per row.
        $products = Product::query()
            ->where('status', true)
            ->whereIn('id', $items->pluck('product_id'))
            ->get()
            ->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if (! $product) {
                // Either the id doesn't exist (OrderRequest already checked
                // that) or it does but is disabled — a disabled product
                // can't be ordered even if someone still has it in a
                // stale/cached cart.
                throw ValidationException::withMessages([
                    'items' => "One of the items in your cart is no longer available.",
                ]);
            }

            if ($item['quantity'] < $product->min_quantity) {
                throw ValidationException::withMessages([
                    'items' => "{$product->name} has a minimum order quantity of {$product->min_quantity}.",
                ]);
            }

            if ($product->max_quantity && $item['quantity'] > $product->max_quantity) {
                throw ValidationException::withMessages([
                    'items' => "{$product->name} has a maximum order quantity of {$product->max_quantity}.",
                ]);
            }
        }

        $order = DB::transaction(function () use ($items, $products, $request) {
            $subtotal = $items->reduce(function (string $carry, array $item) use ($products) {
                $product = $products->get($item['product_id']);

                return bcadd($carry, bcmul((string) $product->base_price, (string) $item['quantity'], 2), 2);
            }, '0');

            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $request->validated('customer_name'),
                'customer_email' => $request->validated('customer_email'),
                'customer_phone' => $request->validated('customer_phone'),
                'shipping_address' => $request->validated('shipping_address'),
                'notes' => $request->validated('notes'),
                'subtotal' => $subtotal,
            ]);

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'unit_price' => $product->base_price,
                    'quantity' => $item['quantity'],
                    'line_total' => bcmul((string) $product->base_price, (string) $item['quantity'], 2),
                    'design_delivery_method' => $item['design_delivery_method'] ?? null,
                    'design_reference' => $item['design_reference'] ?? null,
                    'design_original_filename' => $item['design_original_filename'] ?? null,
                ]);
            }

            return $order;
        });

        return response()->json([
            'status' => 'success',
            'message' => "Thanks — we've received your order and will be in touch shortly.",
            'data' => $order->load('items'),
        ], 201);
    }

    /**
     * Team only: the order queue. Newest first, optionally filtered by
     * status and by handler (?assigned_to=me | none | <user id>) — same
     * shape as ContactInquiryController::index.
     */
    public function index(Request $request)
    {
        $query = Order::query()->with('items', 'assignee:id,name,role')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('assigned_to')) {
            $handler = (string) $request->string('assigned_to');
            match (true) {
                $handler === 'none' => $query->whereNull('assigned_to'),
                $handler === 'me' => $query->where('assigned_to', $request->user()->id),
                ctype_digit($handler) => $query->where('assigned_to', (int) $handler),
                default => null,
            };
        }

        return response()->json(['status' => 'success', 'data' => $query->paginate(20)]);
    }

    public function show(Request $request, Order $order)
    {
        // Same rule as inquiries: the first non-admin team member to open an
        // unassigned order becomes its handler.
        if (! $request->user()->isAdmin()) {
            $order->claimFor($request->user());
        }

        return response()->json([
            'status' => 'success',
            'data' => $order->load('items', 'assignee:id,name,role', 'activities'),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $order->changeStatus($request->validated('status'), $request->user());

        return response()->json([
            'status' => 'success',
            'data' => $order->fresh(['items', 'assignee:id,name,role', 'activities']),
        ]);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json(['status' => 'success', 'message' => 'Order deleted.']);
    }
}
