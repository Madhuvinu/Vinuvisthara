<?php

namespace App\Filament\Resources\SliderImageResource\Pages;

use App\Filament\Resources\SliderImageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSliderImage extends EditRecord
{
    protected static string $resource = SliderImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * Return preview image URL for the slider fit/position preview (edit page).
     */
    public function getSliderPreviewImageUrl(): ?string
    {
        $raw = $this->record->getRawOriginal('image_url');
        $path = is_array($raw) ? ($raw[0] ?? null) : $raw;
        if (! is_string($path) || $path === '') {
            return null;
        }
        return asset('storage/' . ltrim($path, '/'));
    }

    /**
     * Return mobile preview image URL for the mobile slider preview (edit page).
     */
    public function getMobilePreviewImageUrl(): ?string
    {
        // First, try Filament's built-in method for file attachment URLs (handles temp uploads)
        try {
            $url = $this->getFormComponentFileAttachmentUrl('mobile_image_url');
            if ($url) {
                return $url;
            }
        } catch (\Exception $e) {
            // Continue to fallback
        }

        // Try to get the file attachment directly (for temporary uploads)
        try {
            $fileAttachment = $this->getFormComponentFileAttachment('mobile_image_url');
            if ($fileAttachment instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile) {
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

        // Try form state (for live updates) - catch validation errors to prevent breaking preview
        try {
            $formState = $this->form->getState();
            $mobileImageUrl = $formState['mobile_image_url'] ?? null;
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If validation fails, get raw data without validation
            $mobileImageUrl = $this->data['mobile_image_url'] ?? null;
        } catch (\Exception $e) {
            $mobileImageUrl = null;
        }
        
        if ($mobileImageUrl) {
            // Handle array format
            if (is_array($mobileImageUrl)) {
                // Check if array has valid elements
                if (!empty($mobileImageUrl)) {
                    $first = \Illuminate\Support\Arr::first($mobileImageUrl);
                    if (is_string($first) && $first !== '') {
                        $path = ltrim($first, '/');
                        if (str_starts_with($path, 'livewire-temp/')) {
                            $full = storage_path('app/' . $path);
                            if (is_file($full)) {
                                $mime = mime_content_type($full) ?: 'image/jpeg';
                                return 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($full));
                            }
                        }
                        if (str_starts_with($path, 'http')) {
                            return $path;
                        }
                        return asset('storage/' . $path);
                    }
                }
            } elseif (is_string($mobileImageUrl) && $mobileImageUrl !== '') {
                // Handle string path
                $path = ltrim($mobileImageUrl, '/');
                if (str_starts_with($path, 'http')) {
                    return $path;
                }
                return asset('storage/' . $path);
            }
        }
        
        // Fallback to record if form state is empty
        if ($this->record && $this->record->exists) {
            $raw = $this->record->getRawOriginal('mobile_image_url');
            if ($raw) {
                $path = is_array($raw) ? ($raw[0] ?? null) : $raw;
                if (is_string($path) && $path !== '') {
                    return asset('storage/' . ltrim($path, '/'));
                }
            }
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

    /**
     * Mutate form data before saving to preserve existing image if not changed.
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Helper function to check if Filament file upload array is effectively empty
        $isEmptyFileUpload = function ($value) {
            if (empty($value)) {
                return true;
            }
            if (is_array($value)) {
                // Filter out empty arrays and Filament's special markers
                $filtered = array_filter($value, function ($item) {
                    if (is_array($item)) {
                        return !empty($item);
                    }
                    // Check if it's a string path (not empty)
                    return is_string($item) && trim($item) !== '';
                });
                return empty($filtered);
            }
            return false;
        };

        // If image_url is empty or effectively empty, preserve the existing value
        if (isset($data['image_url']) && $isEmptyFileUpload($data['image_url'])) {
            if ($this->record && $this->record->exists) {
                $existingImage = $this->record->getRawOriginal('image_url');
                if ($existingImage) {
                    // Preserve existing image - convert to Filament's expected format if needed
                    $data['image_url'] = is_array($existingImage) ? $existingImage : [$existingImage];
                }
            }
        }

        // Same for mobile_image_url (this one can be null)
        if (isset($data['mobile_image_url']) && $isEmptyFileUpload($data['mobile_image_url'])) {
            if ($this->record && $this->record->exists) {
                $existingMobileImage = $this->record->getRawOriginal('mobile_image_url');
                if ($existingMobileImage) {
                    // Preserve existing mobile image
                    $data['mobile_image_url'] = is_array($existingMobileImage) ? $existingMobileImage : [$existingMobileImage];
                } else {
                    // If no existing mobile image and form has empty value, set to null
                    $data['mobile_image_url'] = null;
                }
            }
        }

        return $data;
    }
}
