<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('fulfillment_status')->default('pending')->after('status'); // pending, processing, picked, packed, shipped, delivered
            $table->string('tracking_number')->nullable()->after('fulfillment_status');
            $table->string('carrier')->nullable()->after('tracking_number');
            $table->timestamp('processed_at')->nullable()->after('delivered_at');
            $table->timestamp('picked_at')->nullable()->after('processed_at');
            $table->timestamp('packed_at')->nullable()->after('picked_at');
            $table->text('fulfillment_notes')->nullable()->after('packed_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'fulfillment_status',
                'tracking_number',
                'carrier',
                'processed_at',
                'picked_at',
                'packed_at',
                'fulfillment_notes',
            ]);
        });
    }
};
