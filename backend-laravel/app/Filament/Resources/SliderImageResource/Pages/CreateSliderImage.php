<?php

namespace App\Filament\Resources\SliderImageResource\Pages;

use App\Filament\Resources\SliderImageResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Arr;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class CreateSliderImage extends CreateRecord
{
    protected static string $resource = SliderImageResource::class;

    /**
     * Return preview image URL for the slider fit/position preview (create page).
     * Uses temp upload or stored path from form state.
     */
    public function getSliderPreviewImageUrl(): ?string
    {
        // First, try Filament's built-in method for file attachment URLs
        try {
            $url = $this->getFormComponentFileAttachmentUrl('image_url');
            if ($url) {
                return $url;
            }
        } catch (\Exception $e) {
            // Continue to fallback
        }

        // Try to get the file attachment directly
        try {
            $fileAttachment = $this->getFormComponentFileAttachment('image_url');
            if ($fileAttachment instanceof TemporaryUploadedFile) {
                // Read file and return data URL (most reliable for preview)
                $path = $fileAttachment->getRealPath();
                if ($path && is_file($path)) {
                    $mime = $fileAttachment->getMimeType() ?: 'image/jpeg';
                    $data = base64_encode(file_get_contents($path));
                    return 'data:' . $mime . ';base64,' . $data;
                }
            }
        } catch (\Exception $e) {
            // Fall through to other methods
        }

        // Fallback: check form state directly
        $value = $this->data['image_url'] ?? null;
        if (! $value) {
            return null;
        }

        // Handle array format (Filament stores as array)
        if (is_array($value)) {
            // If it's an array of TemporaryUploadedFile instances
            $first = Arr::first($value);
            if ($first instanceof TemporaryUploadedFile) {
                $path = $first->getRealPath();
                if ($path && is_file($path)) {
                    $mime = $first->getMimeType() ?: 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
                }
            }
            // If it's an array of strings, get first
            $value = Arr::first($value);
        }

        // Handle string path
        if (is_string($value) && $value !== '') {
            $path = ltrim($value, '/');
            if (str_starts_with($path, 'livewire-temp/')) {
                $full = storage_path('app/' . $path);
                if (is_file($full)) {
                    $mime = mime_content_type($full) ?: 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($full));
                }
            }
            return asset('storage/' . $path);
        }

        return null;
    }

    /**
     * Return mobile preview image URL for the mobile slider preview (create page).
     * Uses temp upload or stored path from form state.
     */
    public function getMobilePreviewImageUrl(): ?string
    {
        // First, try Filament's built-in method for file attachment URLs
        try {
            $url = $this->getFormComponentFileAttachmentUrl('mobile_image_url');
            if ($url) {
                return $url;
            }
        } catch (\Exception $e) {
            // Continue to fallback
        }

        // Try to get the file attachment directly
        try {
            $fileAttachment = $this->getFormComponentFileAttachment('mobile_image_url');
            if ($fileAttachment instanceof TemporaryUploadedFile) {
                // Read file and return data URL (most reliable for preview)
                $path = $fileAttachment->getRealPath();
                if ($path && is_file($path)) {
                    $mime = $fileAttachment->getMimeType() ?: 'image/jpeg';
                    $data = base64_encode(file_get_contents($path));
                    return 'data:' . $mime . ';base64,' . $data;
                }
            }
        } catch (\Exception $e) {
            // Fall through to other methods
        }

        // Fallback: check form state directly
        $value = $this->data['mobile_image_url'] ?? null;
        if (! $value) {
            return null;
        }

        // Handle array format (Filament stores as array)
        if (is_array($value)) {
            // If it's an array of TemporaryUploadedFile instances
            $first = Arr::first($value);
            if ($first instanceof TemporaryUploadedFile) {
                $path = $first->getRealPath();
                if ($path && is_file($path)) {
                    $mime = $first->getMimeType() ?: 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($path));
                }
            }
            // If it's an array of strings, get first
            $value = Arr::first($value);
        }

        // Handle string path
        if (is_string($value) && $value !== '') {
            $path = ltrim($value, '/');
            if (str_starts_with($path, 'livewire-temp/')) {
                $full = storage_path('app/' . $path);
                if (is_file($full)) {
                    $mime = mime_content_type($full) ?: 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($full));
                }
            }
            return asset('storage/' . $path);
        }

        return null;
    }

    public function sliderZoomIn(): void
    {
        $state = $this->form->getState();
        $z = min(2, (float) ($state['image_zoom'] ?? 1) + 0.1);
        $this->form->fill(['image_zoom' => $z]);
    }

    public function sliderZoomOut(): void
    {
        $state = $this->form->getState();
        $z = max(0.5, (float) ($state['image_zoom'] ?? 1) - 0.1);
        $this->form->fill(['image_zoom' => $z]);
    }

    public function sliderZoomReset(): void
    {
        $this->form->fill(['image_zoom' => 1]);
    }
}
