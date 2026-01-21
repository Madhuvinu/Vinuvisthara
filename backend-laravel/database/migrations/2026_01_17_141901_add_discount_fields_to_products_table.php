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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('compare_at_price')->default(0);
            $table->decimal('discount_amount', 10, 2)->nullable()->after('discount_percentage')->default(0);
            $table->boolean('has_discount')->default(false)->after('discount_amount');
            $table->timestamp('discount_starts_at')->nullable()->after('has_discount');
            $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            $table->string('offer_text')->nullable()->after('discount_ends_at')->comment('e.g., "Buy 2 Get 1 Free", "50% Off"');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'discount_percentage',
                'discount_amount',
                'has_discount',
                'discount_starts_at',
                'discount_ends_at',
                'offer_text',
            ]);
        });
    }
};
