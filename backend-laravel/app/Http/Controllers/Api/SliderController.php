<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SliderImage;
use Illuminate\Http\Request;

class SliderController extends Controller
{
    public function index()
    {
        $sliders = SliderImage::with('images')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json([
            'sliders' => $sliders->map(function ($slider) {
                // Handle Filament file upload format (array) or string
                $imageUrl = $slider->getRawOriginal('image_url');
                if (is_array($imageUrl)) {
                    $imageUrl = !empty($imageUrl) ? $imageUrl[0] : null;
                }
                if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
                    $imageUrl = asset('storage/' . $imageUrl);
                }
                
                // Handle mobile image URL
                $mobileImageUrl = $slider->getRawOriginal('mobile_image_url');
                if (is_array($mobileImageUrl)) {
                    $mobileImageUrl = !empty($mobileImageUrl) ? $mobileImageUrl[0] : null;
                }
                if ($mobileImageUrl && !str_starts_with($mobileImageUrl, 'http')) {
                    $mobileImageUrl = asset('storage/' . $mobileImageUrl);
                }
                
                // Get all additional images
                $additionalImages = $slider->images->map(function ($item) {
                    $itemImageUrl = $item->image_url;
                    if (is_array($itemImageUrl)) {
                        $itemImageUrl = !empty($itemImageUrl) ? $itemImageUrl[0] : null;
                    }
                    if ($itemImageUrl && !str_starts_with($itemImageUrl, 'http')) {
                        $itemImageUrl = asset('storage/' . $itemImageUrl);
                    }
                    return [
                        'id' => $item->id,
                        'image_url' => $itemImageUrl,
                        'order' => $item->order,
                        'is_primary' => $item->is_primary,
                    ];
                })->toArray();
                
                // Combine main image with additional images
                $allImages = [];
                if ($imageUrl) {
                    $allImages[] = [
                        'id' => 'main',
                        'image_url' => $imageUrl,
                        'order' => 0,
                        'is_primary' => true,
                    ];
                }
                $allImages = array_merge($allImages, $additionalImages);
                // Sort by order
                usort($allImages, function($a, $b) {
                    return $a['order'] <=> $b['order'];
                });
                
                return [
                    'id' => $slider->id,
                    'title' => $slider->title,
                    'description' => $slider->description,
                    'image_url' => $imageUrl,
                    'object_fit' => $slider->object_fit ?? 'cover',
                    'object_position' => $slider->object_position ?? 'center',
                    'image_zoom' => (float) ($slider->image_zoom ?? 1),
                    'mobile_object_fit' => $slider->mobile_object_fit,
                    'mobile_object_position' => $slider->mobile_object_position,
                    'mobile_image_zoom' => $slider->mobile_image_zoom ? (float) $slider->mobile_image_zoom : null,
                    'mobile_image_url' => $mobileImageUrl,
                    'mobile_height' => $slider->mobile_height,
                    'mobile_padding_top' => $slider->mobile_padding_top ?? 0,
                    'mobile_padding_right' => $slider->mobile_padding_right ?? 0,
                    'mobile_padding_bottom' => $slider->mobile_padding_bottom ?? 0,
                    'mobile_padding_left' => $slider->mobile_padding_left ?? 0,
                    'mobile_margin_top' => $slider->mobile_margin_top ?? 0,
                    'mobile_margin_right' => $slider->mobile_margin_right ?? 0,
                    'mobile_margin_bottom' => $slider->mobile_margin_bottom ?? 0,
                    'mobile_margin_left' => $slider->mobile_margin_left ?? 0,
                    'mobile_full_width' => $slider->mobile_full_width ?? false,
                    'images' => $allImages, // All images including main and additional
                    'link' => $slider->link,
                    'button_text' => $slider->button_text,
                    'button_text_color' => $slider->button_text_color,
                    'button_background_color' => $slider->button_background_color,
                    'banner_text' => $slider->banner_text,
                    'background_color' => $slider->background_color,
                    'gradient_color_1' => $slider->gradient_color_1,
                    'gradient_color_2' => $slider->gradient_color_2,
                    'gradient_color_3' => $slider->gradient_color_3,
                    'text_color' => $slider->text_color,
                    'header_color' => $slider->header_color,
                    'order' => $slider->order,
                    'is_active' => $slider->is_active,
                    'sparkle_effect_enabled' => $slider->sparkle_effect_enabled ?? true,
                    'sparkle_color' => $slider->sparkle_color ?? '#ffffff',
                    'sparkle_speed' => $slider->sparkle_speed ?? 15,
                    'card_background_color' => $slider->card_background_color,
                    'card_background_gradient' => $slider->card_background_gradient,
                    'image_inner_background' => $slider->image_inner_background ?? '#ffffff',
                ];
            }),
        ]);
    }

    public function show($id)
    {
        $slider = SliderImage::where('is_active', true)->findOrFail($id);

        return response()->json([
            'id' => $slider->id,
            'title' => $slider->title,
            'description' => $slider->description,
            'image_url' => $slider->image_url,
            'link' => $slider->link,
            'button_text' => $slider->button_text,
            'background_color' => $slider->background_color,
            'gradient_color_1' => $slider->gradient_color_1,
            'gradient_color_2' => $slider->gradient_color_2,
            'gradient_color_3' => $slider->gradient_color_3,
            'text_color' => $slider->text_color,
            'header_color' => $slider->header_color,
            'order' => $slider->order,
            'is_active' => $slider->is_active,
        ]);
    }
}
