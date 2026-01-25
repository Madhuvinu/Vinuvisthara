<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->string('object_fit', 32)->default('contain')->after('image_url');
            $table->string('object_position', 64)->default('center')->after('object_fit');
            $table->decimal('image_zoom', 5, 2)->default(1)->after('object_position');
        });
    }

    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['object_fit', 'object_position', 'image_zoom']);
        });
    }
};
