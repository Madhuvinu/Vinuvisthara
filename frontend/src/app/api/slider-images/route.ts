import { NextResponse } from 'next/server';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/api/slider-images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use no-cache instead of no-store for better compatibility
      cache: 'no-cache',
    });

    if (!response.ok) {
      return NextResponse.json(
        { sliders: [] },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    // Laravel returns: { sliders: [{ id, title, description, image_url, images[], link, order }] }
    // Transform to frontend format
    const sliders = (data.sliders || []).map((item: any) => {
      return {
        id: item.id.toString(),
        imageUrl: item.image_url,
        images: item.images || [], // All images for layered Polaroid effect
        title: item.title || '',
        subtitle: item.description || '',
        buttonText: item.button_text || (item.link ? 'Shop Now' : 'Shop Now'),
        buttonLink: item.link || '/products',
        buttonTextColor: item.button_text_color || null,
        buttonBackgroundColor: item.button_background_color || null,
        backgroundColor: item.background_color || null,
        gradientColor1: item.gradient_color_1 || null,
        gradientColor2: item.gradient_color_2 || null,
        gradientColor3: item.gradient_color_3 || null,
        textColor: item.text_color || null,
        headerColor: item.header_color || null,
        isActive: item.is_active !== false,
        displayOrder: item.order || 0,
        sparkle_effect_enabled: item.sparkle_effect_enabled !== false,
        sparkle_color: item.sparkle_color || '#ffffff',
        sparkle_speed: item.sparkle_speed || 15,
        card_background_color: item.card_background_color || null,
        card_background_gradient: item.card_background_gradient || null,
        image_inner_background: item.image_inner_background || '#ffffff',
      };
    });

    // Filter only active sliders and sort by order
    const activeSliders = sliders
      .filter((s: any) => s.isActive)
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    return NextResponse.json({ sliders: activeSliders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch slider images', sliders: [] },
      { status: 200 }
    );
  }
}
