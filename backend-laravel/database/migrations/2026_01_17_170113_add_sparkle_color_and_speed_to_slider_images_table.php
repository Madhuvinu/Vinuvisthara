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
            $table->string('sparkle_color')->default('#ffffff')->after('sparkle_effect_enabled')->comment('Color of sparkle stars (hex color)');
            $table->integer('sparkle_speed')->default(15)->after('sparkle_color')->comment('Speed of sparkle movement (8-30 seconds, lower = faster)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['sparkle_color', 'sparkle_speed']);
        });
    }
};
