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
            $table->string('button_text_color')->nullable()->after('button_text');
            $table->string('button_background_color')->nullable()->after('button_text_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slider_images', function (Blueprint $table) {
            $table->dropColumn(['button_text_color', 'button_background_color']);
        });
    }
};
