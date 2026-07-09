<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // GET /api/products
public function index(Request $request)
{
    $query = Product::query()->with('category')->where('is_active', true);

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->input('category_id'));
    }

    if ($request->filled('search')) {
        $query->where('name', 'like', '%' . $request->input('search') . '%');
    }

    // admin sees all products including inactive
    if ($request->user()?->isAdmin()) {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }
    }

    $products = $query->paginate(12);

    return response()->json($products);
}

    // GET /api/products/{product}
    public function show(Product $product)
    {
        $product->load('category');

        return response()->json($product);
    }

    // POST /api/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'    => 'nullable|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price'           => 'required|numeric|min:0',
            'compare_price'   => 'nullable|numeric|min:0',
            'stock_qty'       => 'required|integer|min:0',
            'is_active'       => 'in:true,false,1,0',
        ]);

        $validated['is_active'] = $request->boolean('is_active');
        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $product = Product::create($validated);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'CREATE',
            'Product',
            "Admin {$request->user()->name} created product \"{$product->name}\" at {$product->price} DA"
        );

        return response()->json($product, 201);
    }

    // PUT/PATCH /api/products/{product}
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id'    => 'nullable|exists:categories,id',
            'name'            => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'price'           => 'sometimes|numeric|min:0',
            'compare_price'   => 'nullable|numeric|min:0',
            'stock_qty'       => 'sometimes|integer|min:0',
            'is_active'       => 'in:true,false,1,0',
        ]);

        if (isset($validated['is_active'])) {
            $validated['is_active'] = $request->boolean('is_active');
        }
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->image));
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $product->update($validated);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'UPDATE',
            'Product',
            "Admin {$request->user()->name} updated product \"{$product->name}\""
        );

        return response()->json($product);
    }

    // DELETE /api/products/{product}
    public function destroy(Request $request, Product $product)
    {
        $name = $product->name;

        if ($product->image) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image));
        }

        $product->delete();

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'DELETE',
            'Product',
            "Admin {$request->user()->name} deleted product \"{$name}\""
        );

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
