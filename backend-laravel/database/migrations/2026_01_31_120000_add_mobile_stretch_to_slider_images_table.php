<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            // Mobile-only stretch. 1 = normal. Keep these independent from desktop stretch.
            $table->float('mobile_image_scale_x')->default(1)->after('mobile_image_zoom')->comment('Mobile horizontal stretch (scaleX). 1 = normal');
            $table->float('mobile_image_scale_y')->default(1)->after('mobile_image_scale_x')->comment('Mobile vertical stretch (scaleY). 1 = normal');
        });
    }

    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['mobile_image_scale_x', 'mobile_image_scale_y']);
        });
    }
};

