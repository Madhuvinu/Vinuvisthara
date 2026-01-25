@php
    $previewUrl = $previewUrl ?? null;
    $mobilePreviewUrl = $mobilePreviewUrl ?? null;
    $objectFit = $objectFit ?? 'cover';
    $objectPosition = $objectPosition ?? 'center center';
    $zoom = (float) ($zoom ?? 1);
    $mobileHeight = $mobileHeight ?? null;
    // Mobile preview dimensions (matches mobile viewport)
    $previewHeight = $mobileHeight ? (int)$mobileHeight : 240; // Default mobile height
    $previewWidth = 360; // Typical mobile width
@endphp

<div class="rounded-xl border border-gray-200 bg-gray-100 p-4" x-data="{}">
    <p class="mb-3 text-sm font-medium text-gray-700">Mobile Preview (matches mobile viewport ~360px width)</p>

    {{-- Mobile slider frame --}}
    <div
        class="relative mx-auto overflow-hidden rounded-lg bg-gray-200 shadow-inner"
        style="width: {{ $previewWidth }}px; height: {{ $previewHeight }}px; max-width: 100%; position: relative;"
    >
        @php
            $imageToUse = $mobilePreviewUrl ?: $previewUrl;
        @endphp
        
        @if($imageToUse)
            {{-- Image container with zoom transform --}}
            <div
                class="absolute inset-0"
                style="
                    transform: scale({{ $zoom }});
                    transform-origin: center center;
                    width: 100%;
                    height: 100%;
                "
            >
                {{-- Image with object-fit and object-position --}}
                <img
                    src="{{ $imageToUse }}"
                    alt="Mobile slider preview"
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
                <span class="text-sm">Upload an image to see preview</span>
            </div>
        @endif
    </div>
    
    {{-- Info about mobile settings --}}
    <div class="mt-2 space-y-1 text-xs text-gray-500">
        @if($mobilePreviewUrl)
            <div><span class="font-medium text-blue-600">✓ Using mobile image</span></div>
        @elseif($previewUrl)
            <div><span class="font-medium text-gray-600">Using desktop image</span> (no mobile image uploaded)</div>
        @endif
        
        @if($mobileHeight)
            <div><span class="font-medium">Height:</span> {{ $mobileHeight }}px</div>
        @else
            <div><span class="font-medium">Height:</span> Auto (240px default)</div>
        @endif
        
        <div><span class="font-medium">Fit:</span> {{ $objectFit }} | <span class="font-medium">Position:</span> {{ $objectPosition }} | <span class="font-medium">Zoom:</span> {{ $zoom }}×</div>
    </div>
</div>
