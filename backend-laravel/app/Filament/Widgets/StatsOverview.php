<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Schema;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        // Safely get counts, handling missing tables
        $totalOrders = $this->safeCount(Order::class, 'orders');
        $totalCustomers = $this->safeCount(Customer::class, 'customers');
        $totalProducts = $this->safeProductCount();
        $totalRevenue = $this->safeRevenue();

        return [
            Stat::make('Total Orders', $totalOrders)
                ->description('All time orders')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('success'),
            Stat::make('Total Customers', $totalCustomers)
                ->description('Registered customers')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),
            Stat::make('Published Products', $totalProducts)
                ->description('Active products')
                ->descriptionIcon('heroicon-m-cube')
                ->color('warning'),
            Stat::make('Total Revenue', '₹' . number_format($totalRevenue, 2))
                ->description('Completed orders')
                ->descriptionIcon('heroicon-m-currency-rupee')
                ->color('success'),
        ];
    }

    /**
     * Safely count records, returning 0 if table doesn't exist
     */
    private function safeCount(string $modelClass, string $tableName): int
    {
        try {
            if (!Schema::hasTable($tableName)) {
                return 0;
            }
            return $modelClass::count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Safely count published products
     */
    private function safeProductCount(): int
    {
        try {
            if (!Schema::hasTable('products')) {
                return 0;
            }
            return Product::where('status', 'published')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Safely calculate total revenue
     */
    private function safeRevenue(): float
    {
        try {
            if (!Schema::hasTable('orders')) {
                return 0;
            }
            return Order::where('status', 'completed')->sum('total') ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
}
