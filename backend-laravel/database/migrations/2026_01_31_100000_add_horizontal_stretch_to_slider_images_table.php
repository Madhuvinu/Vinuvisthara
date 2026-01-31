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
            // Desktop/tablet horizontal stretch (scaleX). 1 = normal.
            $table->float('image_scale_x')->default(1)->after('image_zoom')->comment('Desktop horizontal stretch (scaleX). 1 = normal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn('image_scale_x');
        });
    }
};

