<?php

namespace App\Filament\Resources\SliderImageResource\Pages;

use App\Filament\Resources\SliderImageResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ViewSliderImage extends ViewRecord
{
    protected static string $resource = SliderImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Layered Polaroid Preview')
                    ->description('Preview of slider images with layered Polaroid effect')
                    ->schema([
                        Infolists\Components\View::make('slider-polaroid-preview')
                            ->view('filament.resources.slider-image-resource.pages.polaroid-preview')
                            ->viewData([
                                'record' => $this->record,
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
