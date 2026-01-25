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
            $table->text('mobile_image_url')->nullable()->after('image_url')->comment('Separate image for mobile view');
            $table->integer('mobile_height')->nullable()->after('mobile_image_zoom')->comment('Mobile-specific height in pixels');
            $table->integer('mobile_padding_top')->nullable()->after('mobile_height')->default(0)->comment('Mobile padding top in pixels');
            $table->integer('mobile_padding_right')->nullable()->after('mobile_padding_top')->default(0)->comment('Mobile padding right in pixels');
            $table->integer('mobile_padding_bottom')->nullable()->after('mobile_padding_right')->default(0)->comment('Mobile padding bottom in pixels');
            $table->integer('mobile_padding_left')->nullable()->after('mobile_padding_bottom')->default(0)->comment('Mobile padding left in pixels');
            $table->integer('mobile_margin_top')->nullable()->after('mobile_padding_left')->default(0)->comment('Mobile margin top in pixels');
            $table->integer('mobile_margin_right')->nullable()->after('mobile_margin_top')->default(0)->comment('Mobile margin right in pixels');
            $table->integer('mobile_margin_bottom')->nullable()->after('mobile_margin_right')->default(0)->comment('Mobile margin bottom in pixels');
            $table->integer('mobile_margin_left')->nullable()->after('mobile_margin_bottom')->default(0)->comment('Mobile margin left in pixels');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn([
                'mobile_image_url',
                'mobile_height',
                'mobile_padding_top',
                'mobile_padding_right',
                'mobile_padding_bottom',
                'mobile_padding_left',
                'mobile_margin_top',
                'mobile_margin_right',
                'mobile_margin_bottom',
                'mobile_margin_left',
            ]);
        });
    }
};
