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
            $table->string('gradient_color_1')->nullable()->after('background_color');
            $table->string('gradient_color_2')->nullable()->after('gradient_color_1');
            $table->string('gradient_color_3')->nullable()->after('gradient_color_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['gradient_color_1', 'gradient_color_2', 'gradient_color_3']);
        });
    }
};
