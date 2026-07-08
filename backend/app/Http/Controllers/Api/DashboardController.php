<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders  = Order::count();
        $totalProducts = Product::count();
        $totalCustomers = User::where('role', 'customer')->count();

        $todayOrders  = Order::whereDate('created_at', today())->count();
        $todayRevenue = Order::whereDate('created_at', today())
                            ->where('payment_status', 'paid')
                            ->sum('total');

        return response()->json([
            'total_revenue'   => number_format($totalRevenue, 2),
            'total_orders'    => $totalOrders,
            'total_products'  => $totalProducts,
            'total_customers' => $totalCustomers,
            'today_orders'    => $todayOrders,
            'today_revenue'   => number_format($todayRevenue, 2),
        ]);
    }

    public function recentOrders()
    {
        $orders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id'             => $order->id,
                'ref'            => '#ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                'customer'       => $order->user?->name,
                'status'         => $order->status,
                'payment_status' => $order->payment_status,
                'total'          => '$' . number_format($order->total, 2),
                'date'           => $order->created_at->diffForHumans(),
            ]);

        return response()->json($orders);
    }
    public function topCategories()
{
    $categories = \App\Models\Category::withCount('products')
        ->orderBy('products_count', 'desc')
        ->take(5)
        ->get()
        ->map(fn($cat) => [
            'name'     => $cat->name,
            'count'    => $cat->products_count,
        ]);

    // calculate percentage based on top category
    $max = $categories->max('count') ?: 1;

    return response()->json(
        $categories->map(fn($cat) => [
            'name'       => $cat['name'],
            'count'      => $cat['count'],
            'percentage' => round(($cat['count'] / $max) * 100),
        ])
    );
}
}