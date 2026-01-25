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
            $table->string('card_background_color')->nullable()->after('sparkle_speed')->comment('Background color for the hero card (hex color, e.g., #0e3a46)');
            $table->text('card_background_gradient')->nullable()->after('card_background_color')->comment('Optional gradient background for the hero card (CSS gradient string)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['card_background_color', 'card_background_gradient']);
        });
    }
};
