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
            // Check if user_id exists and needs to be changed
            if (Schema::hasColumn('orders', 'user_id')) {
                // Drop foreign key if it exists
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, continue
                }
                $table->dropColumn('user_id');
            }
            
            // Add customer_id column if it doesn't exist
            if (!Schema::hasColumn('orders', 'customer_id')) {
                $table->foreignId('customer_id')->nullable()->after('id')->constrained('customers')->onDelete('cascade');
            } else {
                // Column exists, just ensure foreign key is set
                try {
                    $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
                } catch (\Exception $e) {
                    // Foreign key might already exist, that's fine
                }
            }
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
