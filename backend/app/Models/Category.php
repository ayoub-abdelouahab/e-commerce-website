<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'parent_id',
    ];

    // ✅ Relationships

    // Category has many products
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Category can have a parent category
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Category can have sub-categories
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}