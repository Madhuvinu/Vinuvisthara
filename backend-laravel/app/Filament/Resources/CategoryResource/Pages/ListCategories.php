<?php

namespace App\Filament\Resources\CategoryResource\Pages;

use App\Filament\Resources\CategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCategories extends ListRecords
{
    protected static string $resource = CategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
            Actions\Action::make('collectionsBackground')
                ->label('Collections Background')
                ->icon('heroicon-o-paint-brush')
                ->form([
                    \Filament\Forms\Components\Section::make('Collections Section Background Color')
                        ->description('Set the background color for the "Our Collections" section on the homepage')
                        ->schema([
                            \Filament\Forms\Components\ColorPicker::make('section_background_color')
                                ->label('Background Color')
                                ->helperText('Solid background color (e.g., #FBF6F1). Overridden by gradient if set.')
                                ->default(fn () => \App\Models\CollectionsSetting::getSettings()->section_background_color ?? '#FBF6F1')
                                ->live(),
                            
                            \Filament\Forms\Components\Textarea::make('section_background_gradient')
                                ->label('Background Gradient (CSS)')
                                ->rows(3)
                                ->placeholder('linear-gradient(180deg, #FBF6F1, #F3EADF)')
                                ->helperText('Full CSS gradient string. If provided, this will override the solid color.')
                                ->default(fn () => \App\Models\CollectionsSetting::getSettings()->section_background_gradient ?? 'linear-gradient(180deg, #FBF6F1, #F3EADF)')
                                ->live(),
                        ])
                        ->columns(2),
                ])
                ->action(function (array $data) {
                    $settings = \App\Models\CollectionsSetting::getSettings();
                    $settings->update([
                        'section_background_color' => $data['section_background_color'] ?? '#FBF6F1',
                        'section_background_gradient' => $data['section_background_gradient'] ?? null,
                    ]);
                    
                    \Filament\Notifications\Notification::make()
                        ->title('Background color saved successfully!')
                        ->success()
                        ->send();
                }),
        ];
    }
}
