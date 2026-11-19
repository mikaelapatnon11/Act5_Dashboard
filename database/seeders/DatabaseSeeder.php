<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Review;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = Category::factory(5)->create();

        // 2. Products (Seed at least 2,000 products)
        $products = Product::factory(2000)
            ->recycle($categories)
            ->create();

        // 3. Users
        $users = User::factory(20)->create();

        // 4. Addresses (1-2 per user)
        $users->each(function ($user) {
            Address::factory(rand(1, 2))
                ->for($user)
                ->create();
        });

        // 5. Orders (0-5 per user)
        $orders = $users->flatMap(function ($user) {
            return Order::factory(rand(0, 5))
                ->for($user)
                ->create();
        });

        // 6. Order Products (1-4 products per order)
        $orders->each(function ($order) use ($products) {
            $orderProducts = $products->random(rand(1, 4));

            foreach ($orderProducts as $product) {
                OrderProduct::factory()
                    ->for($order)
                    ->for($product)
                    ->create();
            }
        });

        // 7. Reviews (0-8 reviews per product)
        $products->each(function ($product) use ($users) {
            $reviewers = $users->random(rand(0, 8));

            foreach ($reviewers as $user) {
                Review::factory()
                    ->for($user)
                    ->for($product)
                    ->create();
            }
        });
    }
}