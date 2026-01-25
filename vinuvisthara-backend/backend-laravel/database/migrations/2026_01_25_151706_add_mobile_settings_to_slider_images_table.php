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
            $table->string('mobile_object_fit')->nullable()->after('object_fit')->comment('Mobile-specific object-fit (cover, contain, fill, etc.)');
            $table->string('mobile_object_position')->nullable()->after('object_position')->comment('Mobile-specific object-position (center, left, right, top, bottom, etc.)');
            $table->decimal('mobile_image_zoom', 3, 1)->nullable()->after('image_zoom')->comment('Mobile-specific zoom level (0.5 to 2.0). Leave null to use desktop zoom.');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['mobile_object_fit', 'mobile_object_position', 'mobile_image_zoom']);
        });
    }
};
