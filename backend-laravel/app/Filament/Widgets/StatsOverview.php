<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $totalOrders = Order::count();
        $totalCustomers = Customer::count();
        $totalProducts = Product::where('status', 'published')->count();
        $totalRevenue = Order::where('status', 'completed')->sum('total');

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
}
