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
        Schema::table('categories', function (Blueprint $table) {
            $table->decimal('image_scale', 3, 2)->default(1.00)->after('image_position')->comment('Image scale/zoom (0.5 to 2.0, 1.0 = normal)');
            $table->string('image_align_horizontal')->default('center')->after('image_scale')->comment('Horizontal alignment: left, center, right');
            $table->string('image_align_vertical')->default('center')->after('image_align_horizontal')->comment('Vertical alignment: top, center, bottom');
            $table->integer('image_offset_x')->default(0)->after('image_align_vertical')->comment('Horizontal offset in pixels (-100 to 100)');
            $table->integer('image_offset_y')->default(0)->after('image_offset_x')->comment('Vertical offset in pixels (-100 to 100)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'image_scale',
                'image_align_horizontal',
                'image_align_vertical',
                'image_offset_x',
                'image_offset_y',
            ]);
        });
    }
};
