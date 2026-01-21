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
            $table->string('card_width')->nullable()->after('image')->comment('Card width: small, medium, large, or custom px value');
            $table->string('card_height')->nullable()->after('card_width')->comment('Card height: small, medium, large, or custom px value');
            $table->string('image_fit')->default('cover')->after('card_height')->comment('Image fit: cover, contain, fill, none');
            $table->string('image_position')->default('center')->after('image_fit')->comment('Image position: center, top, bottom, left, right');
            $table->integer('spacing')->default(16)->after('image_position')->comment('Spacing around card in pixels');
            $table->string('aspect_ratio')->nullable()->after('spacing')->comment('Aspect ratio: 1:1, 4:3, 16:9, 4:5, or custom');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'card_width',
                'card_height',
                'image_fit',
                'image_position',
                'spacing',
                'aspect_ratio',
            ]);
        });
    }
};
