<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // GET /api/orders
    public function index(Request $request)
    {
        $query = Order::with('user')
            ->latest();

        // admin sees all orders, customer sees only their own
        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    // GET /api/orders/{order}
    public function show(Request $request, Order $order)
    {
        // customer can only see their own order
        if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->load('user', 'items.product');

        return response()->json($order);
    }

    // PATCH /api/orders/{order}/status  (admin only)
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update($validated);

        return response()->json($order);
    }

    // PATCH /api/orders/{order}/payment  (admin only)
    public function updatePayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,refunded',
        ]);

        $order->update($validated);

        return response()->json($order);
    }
}