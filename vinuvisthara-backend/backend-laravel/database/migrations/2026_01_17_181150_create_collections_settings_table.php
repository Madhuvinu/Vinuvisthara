<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collections_settings', function (Blueprint $table) {
            $table->id();
            $table->string('section_background_color')->nullable()->default('#FBF6F1');
            $table->string('section_background_gradient')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        DB::table('collections_settings')->insert([
            'section_background_color' => '#FBF6F1',
            'section_background_gradient' => 'linear-gradient(180deg, #FBF6F1, #F3EADF)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collections_settings');
    }
};
