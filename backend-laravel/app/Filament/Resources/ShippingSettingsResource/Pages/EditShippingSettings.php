<?php

namespace App\Filament\Resources\ShippingSettingsResource\Pages;

use App\Filament\Resources\ShippingSettingsResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditShippingSettings extends EditRecord
{
    protected static string $resource = ShippingSettingsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
