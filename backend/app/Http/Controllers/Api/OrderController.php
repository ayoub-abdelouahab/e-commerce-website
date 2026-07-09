<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/orders
    public function index(Request $request)
    {
        $query = Order::with('user', 'items.product')
            ->latest();

        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    // GET /api/orders/{order}
    public function show(Request $request, Order $order)
    {
        if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->load('user', 'items.product');

        return response()->json($order);
    }

    // POST /api/orders  (Cash on Delivery)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'      => 'required|string|max:255',
            'phone'              => 'required|string|max:20',
            'wilaya'             => 'required|string|max:255',
            'commune'            => 'required|string|max:255',
            'address_details'    => 'nullable|string|max:500',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'notes'              => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;
        $subtotal = 0;
        $orderItems = [];

        DB::beginTransaction();
        try {
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                Product::where('id', $product->id)->lockForUpdate()->value('id');

                if ($product->stock_qty < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}. Available: {$product->stock_qty}",
                    ], 422);
                }

                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $product->price,
                    'line_total' => $lineTotal,
                ];

                $product->decrement('stock_qty', $item['quantity']);
            }

            $shippingCost = ShippingService::getCost($validated['wilaya']);
            $total = $subtotal + $shippingCost;

            $order = Order::create([
                'user_id'        => $userId,
                'customer_name'  => $validated['customer_name'],
                'phone'          => $validated['phone'],
                'wilaya'         => $validated['wilaya'],
                'commune'        => $validated['commune'],
                'address_details'=> $validated['address_details'] ?? null,
                'status'         => 'pending',
                'subtotal'       => $subtotal,
                'shipping_cost'  => $shippingCost,
                'total'          => $total,
                'payment_status' => 'unpaid',
                'payment_method' => 'COD',
                'notes'          => $validated['notes'] ?? null,
            ]);

            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order could not be processed. ' . $e->getMessage()], 500);
        }

        $order->load('items.product');

        return response()->json($order, 201);
    }

    // PATCH /api/orders/{order}/status  (admin only)
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status'        => 'required|in:pending,confirmed,accepted,rejected,processing,shipped,delivered,cancelled',
            'delivery_time' => 'nullable|date|after:now',
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'confirmed' && isset($validated['delivery_time'])) {
            $data['delivery_time'] = $validated['delivery_time'];
        }

        if ($validated['status'] === 'delivered') {
            $data['payment_status'] = 'paid';
        }

        $order->update($data);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'UPDATE',
            'Order',
            "Admin {$request->user()->name} changed order #{$order->id} status to \"{$validated['status']}\"" .
            (isset($validated['delivery_time']) ? " with delivery at {$validated['delivery_time']}" : "")
        );

        return response()->json($order);
    }

    // PATCH /api/orders/{order}/payment  (admin only)
    public function updatePayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,refunded',
        ]);

        $order->update($validated);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'UPDATE',
            'Order',
            "Admin {$request->user()->name} changed order #{$order->id} payment status to \"{$validated['payment_status']}\""
        );

        return response()->json($order);
    }
}
