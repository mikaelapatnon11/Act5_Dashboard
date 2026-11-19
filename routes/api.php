<?php

use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\CategoryController;

Route::prefix('v1')->group(function () {
    Route::get('products/queries', [ProductController::class, 'queries'])->name('products.queries');
    Route::apiResource('products', ProductController::class);
    
    // Named route for categories.show referenced by resource
    Route::get('categories/{category}', function ($category) {
        return response()->json(['id' => $category]);
    })->name('categories.show');
    
  Route::get('/categories', [CategoryController::class, 'index']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});