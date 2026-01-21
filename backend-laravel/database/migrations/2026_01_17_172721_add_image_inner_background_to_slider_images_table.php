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
        Schema::table('slider_images', function (Blueprint $table) {
            $table->string('image_inner_background')->nullable()->after('card_background_gradient')->comment('Background color for the inner image card (behind the image, e.g., #ffffff, #f8f1ea)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn('image_inner_background');
        });
    }
};
