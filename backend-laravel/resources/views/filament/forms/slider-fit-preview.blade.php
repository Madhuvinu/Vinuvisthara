@php
    $previewUrl = $previewUrl ?? null;
    $objectFit = $objectFit ?? 'contain';
    $objectPosition = $objectPosition ?? 'center';
    $zoom = (float) ($zoom ?? 1);
    $scaleX = (float) ($scaleX ?? 1);
    $scaleY = (float) ($scaleY ?? 1);
    // Match frontend hero dimensions: 420-480px height, full width
    $previewHeight = 450; // Match md breakpoint
@endphp

<div class="rounded-xl border border-gray-200 bg-gray-100 p-4" x-data="{}">
    <p class="mb-3 text-sm font-medium text-gray-700">Slider preview (matches frontend hero)</p>

    {{-- Slider frame matching frontend hero dimensions (420-480px height, full width) --}}
    <div
        class="relative mx-auto overflow-hidden rounded-lg bg-gray-200 shadow-inner"
        style="width: 100%; height: {{ $previewHeight }}px; max-width: 100%; position: relative;"
    >
        @if($previewUrl)
            {{-- Image container with zoom transform (matches frontend HeroSlider exactly) --}}
            <div
                class="absolute inset-0"
                style="
                    transform: scaleX({{ $scaleX }}) scaleY({{ $scaleY }}) scale({{ $zoom }});
                    transform-origin: center center;
                    width: 100%;
                    height: 100%;
                "
            >
                {{-- Image with object-fit and object-position (matches frontend exactly) --}}
                <img
                    src="{{ $previewUrl }}"
                    alt="Slider preview"
                    class="block h-full w-full"
                    style="
                        object-fit: {{ $objectFit }};
                        object-position: {{ $objectPosition }};
                        display: block;
                    "
                />
            </div>
        @else
            <div class="flex h-full items-center justify-center text-gray-400">
                <span class="text-sm">Upload an image above to see preview</span>
            </div>
        @endif
    </div>
    
    {{-- Info about fit modes --}}
    <div class="mt-2 text-xs text-gray-500">
        @if($objectFit === 'contain')
            <span class="font-medium text-green-600">✓ Contain mode:</span> Full image visible, no cropping. Use zoom &lt; 1 to fit entire image.
        @elseif($objectFit === 'cover')
            <span class="font-medium text-blue-600">Cover mode:</span> Image fills frame, may crop edges. Use zoom to adjust visible area.
        @else
            <span class="font-medium">Fit: {{ $objectFit }}</span>
        @endif
    </div>

    {{-- Zoom controls --}}
    <div class="mt-3 flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">Zoom:</span>
        <button
            type="button"
            wire:click="sliderZoomOut"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Zoom out"
        >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
        </button>
        <button
            type="button"
            wire:click="sliderZoomReset"
            class="inline-flex h-9 min-w-[4rem] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Reset zoom"
        >
            Reset
        </button>
        <button
            type="button"
            wire:click="sliderZoomIn"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Zoom in"
        >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
        </button>
        <span class="text-sm text-gray-500">{{ $zoom }}×</span>
    </div>
</div>
