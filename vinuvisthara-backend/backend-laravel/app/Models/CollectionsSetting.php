<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionsSetting extends Model
{
    protected $fillable = [
        'section_background_color',
        'section_background_gradient',
    ];
    
    // Singleton pattern - always get the first (and only) record
    public static function getSettings()
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'section_background_color' => '#FBF6F1',
                'section_background_gradient' => 'linear-gradient(180deg, #FBF6F1, #F3EADF)',
            ]
        );
    }
}
