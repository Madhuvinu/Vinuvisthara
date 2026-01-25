<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipping_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Shipping');
            $table->enum('type', ['flat_rate', 'free_shipping_threshold', 'weight_based', 'distance_based'])->default('flat_rate');
            $table->decimal('flat_rate_amount', 10, 2)->default(0)->comment('Flat shipping rate in rupees');
            $table->decimal('free_shipping_threshold', 10, 2)->default(999)->comment('Order amount above which shipping is free');
            $table->decimal('weight_rate_per_kg', 10, 2)->default(50)->comment('Shipping cost per kg for weight-based');
            $table->decimal('distance_rate_per_km', 10, 2)->default(5)->comment('Shipping cost per km for distance-based');
            $table->decimal('min_shipping_charge', 10, 2)->default(0)->comment('Minimum shipping charge');
            $table->decimal('max_shipping_charge', 10, 2)->nullable()->comment('Maximum shipping charge (null = no limit)');
            $table->boolean('is_active')->default(true);
            $table->json('applicable_states')->nullable()->comment('States where this shipping applies (null = all states)');
            $table->json('applicable_cities')->nullable()->comment('Cities where this shipping applies (null = all cities)');
            $table->timestamps();
        });
        
        // Insert default shipping settings
        \DB::table('shipping_settings')->insert([
            'name' => 'Default Shipping',
            'type' => 'free_shipping_threshold',
            'flat_rate_amount' => 100,
            'free_shipping_threshold' => 999,
            'weight_rate_per_kg' => 50,
            'distance_rate_per_km' => 5,
            'min_shipping_charge' => 0,
            'max_shipping_charge' => null,
            'is_active' => true,
            'applicable_states' => null,
            'applicable_cities' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_settings');
    }
};
