@php
    $images = $record->images()->orderBy('order')->get();
    $primaryImage = $record->image_url;
    $allImages = collect([$primaryImage])->merge($images->pluck('image_url'))->filter()->values();
@endphp

<div class="relative w-full min-h-[400px] flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
    @if($allImages->count() > 0)
        <div class="relative" style="perspective: 1000px;">
            @foreach($allImages as $index => $imageUrl)
                @php
                    $imagePath = is_array($imageUrl) ? ($imageUrl[0] ?? null) : $imageUrl;
                    if ($imagePath && !filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        $imagePath = asset('storage/' . ltrim($imagePath, '/'));
                    }
                    $rotation = ($index % 3 === 0) ? -8 : (($index % 3 === 1) ? 5 : -3);
                    $offsetX = $index * 20;
                    $offsetY = $index * 15;
                    $zIndex = 100 - $index;
                    $scale = 1.0 - ($index * 0.05);
                @endphp
                
                @if($imagePath)
                    <div 
                        class="absolute transition-all duration-300 hover:scale-105 hover:z-50"
                        style="
                            transform: rotate({{ $rotation }}deg) translate({{ $offsetX }}px, {{ $offsetY }}px) scale({{ $scale }});
                            z-index: {{ $zIndex }};
                            filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15));
                            left: 50%;
                            top: 50%;
                            margin-left: -150px;
                            margin-top: -200px;
                        "
                    >
                        <div class="bg-white p-4 rounded-lg shadow-xl" style="width: 300px; height: 400px;">
                            <img 
                                src="{{ $imagePath }}" 
                                alt="Slider Image {{ $index + 1 }}"
                                class="w-full h-full object-cover rounded"
                                style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
                            />
                        </div>
                    </div>
                @endif
            @endforeach
        </div>
    @else
        <div class="text-center text-gray-400">
            <p>No images to display. Add images in the "Images" tab.</p>
        </div>
    @endif
</div>

<style>
    .polaroid-container:hover > div {
        transform: translateX(10px) !important;
    }
    .polaroid-container:hover > div:first-child {
        transform: scale(1.05) !important;
        z-index: 200 !important;
    }
</style>
