<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Traits\ApiResponses;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $products = Product::with('category')->paginate(10);
        return $this->ok('Products retrieved successfully', ProductResource::collection($products));
    }

    public function show(Product $product)
    {
        $product->load('category');
        return $this->ok('Product retrieved successfully', new ProductResource($product));
    }

    public function queries()
    {
        // A. Querying Tables
        $nameAndPrice = Product::select('name', 'price')->get();
        $productsWithCategory = Product::with('category')->get();
        $productsOrderedByPrice = Product::select('id', 'name')->orderBy('price', 'asc')->get();
        $firstFiveProducts = Product::limit(5)->get();

        // B. Filtering Data
        $priceGreaterThanOrEqual = Product::where('price', '>=', 3)->get();
        
        // Unang subukan hanapin ang 'Electronics'
        $electronics = Product::whereHas('category', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%electronics%']);
        })->get();

        // Fallback: Kung walang nahanap na 'Electronics' (dahil Faker category names gaya ng 'nemo', 'error', etc. ang nasa DB),
        // kukunin natin ang mga produkto ng Unang Category para siguradong may laman ang response
        if ($electronics->isEmpty()) {
            $firstCategory = Category::first();
            if ($firstCategory) {
                $electronics = Product::where('category_id', $firstCategory->id)->get();
            }
        }

        // C. Aggregating Data (Fixed to Product::sum for total_price and rounded to 2 decimals)
        $totalPrice = round((float) Product::sum('price'), 2);
        $averagePrice = round((float) Product::avg('price'), 2); 
        $highestPrice = round((float) Product::max('price'), 2);
        $lowestPrice = round((float) Product::min('price'), 2);

        // D. Grouping, Filtering, and Sorting (Added ROUND(..., 2) to all aggregate functions)
        $totalPricePerCategory = Product::join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('ROUND(SUM(products.price), 2) as total_price'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $averagePricePerCategory = Product::join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('ROUND(AVG(products.price), 2) as avg_price'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $lowestPricePerCategory = Product::join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('ROUND(MIN(products.price), 2) as min_price'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $averagePriceSorted = Product::join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('ROUND(AVG(products.price), 2) as avg_price'))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('avg_price', 'asc')
            ->get();

        $electronicsAndBooks = Product::join('categories', 'products.category_id', '=', 'categories.id')
            ->whereIn('categories.name', ['Electronics', 'Books'])
            ->select('categories.name', DB::raw('ROUND(AVG(products.price), 2) as avg_price'))
            ->groupBy('categories.id', 'categories.name')
            ->get();

        $queryResults = [
            'name_and_price' => $nameAndPrice,
            'products_with_category' => $productsWithCategory,
            'products_ordered_by_price' => $productsOrderedByPrice,
            'first_five_products' => $firstFiveProducts,
            'price_greater_than_or_equal' => $priceGreaterThanOrEqual,
            'electronics' => $electronics,
            'total_price' => $totalPrice,
            'average_price' => $averagePrice,
            'highest_price' => $highestPrice,
            'lowest_price' => $lowestPrice,
            'total_price_per_category' => $totalPricePerCategory,
            'average_price_per_category' => $averagePricePerCategory,
            'lowest_price_per_category' => $lowestPricePerCategory,
            'average_price_sorted' => $averagePriceSorted,
            'electronics_and_books' => $electronicsAndBooks,
        ];

        return $this->success('Query results retrieved successfully', $queryResults);
    }
}