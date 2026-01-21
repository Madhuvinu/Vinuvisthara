<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->boolean('is_picked')->default(false)->after('total');
            $table->boolean('is_packed')->default(false)->after('is_picked');
            $table->timestamp('picked_at')->nullable()->after('is_packed');
            $table->timestamp('packed_at')->nullable()->after('picked_at');
            $table->integer('picked_quantity')->default(0)->after('packed_at');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'is_picked',
                'is_packed',
                'picked_at',
                'packed_at',
                'picked_quantity',
            ]);
        });
    }
};
