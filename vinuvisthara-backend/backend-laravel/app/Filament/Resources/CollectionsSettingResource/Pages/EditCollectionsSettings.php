<?php

namespace App\Filament\Resources\CollectionsSettingResource\Pages;

use App\Filament\Resources\CollectionsSettingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCollectionsSettings extends EditRecord
{
    protected static string $resource = CollectionsSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function mount(int | string $record): void
    {
        // Always use the singleton settings record (id = 1)
        $settings = \App\Models\CollectionsSetting::getSettings();
        parent::mount($settings->id);
    }
    
    protected function resolveRecord(int | string $record): \App\Models\CollectionsSetting
    {
        // Always return the singleton settings record, ignoring the $record parameter
        return \App\Models\CollectionsSetting::getSettings();
    }
    
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
