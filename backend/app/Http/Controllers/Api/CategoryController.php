<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id') // only top-level categories
            ->get();

        return response()->json($categories);
    }

    // GET /api/categories/{category}
    public function show(Category $category)
    {
        $category->load('children', 'products');

        return response()->json($category);
    }

    // POST /api/categories
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();

        $category = Category::create($validated);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'CREATE',
            'Category',
            "Admin {$request->user()->name} created category \"{$category->name}\""
        );

        return response()->json($category, 201);
    }

    // PUT/PATCH /api/categories/{category}
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        $category->update($validated);

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'UPDATE',
            'Category',
            "Admin {$request->user()->name} updated category \"{$category->name}\""
        );

        return response()->json($category);
    }

    // DELETE /api/categories/{category}
    public function destroy(Request $request, Category $category)
    {
        $name = $category->name;
        $category->delete();

        AuditLogger::log(
            $request->user()->id,
            $request->user()->name,
            'DELETE',
            'Category',
            "Admin {$request->user()->name} deleted category \"{$name}\""
        );

        return response()->json(['message' => 'Category deleted successfully']);
    }
}