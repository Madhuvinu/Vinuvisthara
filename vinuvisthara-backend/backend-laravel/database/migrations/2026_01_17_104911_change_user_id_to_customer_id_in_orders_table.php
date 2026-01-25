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
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key and old column
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            
            // Add new customer_id column
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('customers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key and customer_id
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
            
            // Restore user_id
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
        });
    }
};
