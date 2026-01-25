<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CollectionsSettingResource\Pages;
use App\Filament\Resources\CollectionsSettingResource\RelationManagers;
use App\Models\CollectionsSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CollectionsSettingResource extends Resource
{
    protected static ?string $model = CollectionsSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Collections Settings';
    protected static ?string $navigationGroup = 'Shop';
    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Collections Section Background')
                    ->description('Set the background color for the "Our Collections" section on the homepage')
                    ->schema([
                        Forms\Components\ColorPicker::make('section_background_color')
                            ->label('Background Color')
                            ->helperText('Solid background color (e.g., #FBF6F1). Overridden by gradient if set.'),
                        
                        Forms\Components\Textarea::make('section_background_gradient')
                            ->label('Background Gradient (CSS)')
                            ->rows(3)
                            ->placeholder('linear-gradient(180deg, #FBF6F1, #F3EADF)')
                            ->helperText('Full CSS gradient string. If provided, this will override the solid color. Example: linear-gradient(180deg, #FBF6F1, #F3EADF)'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageCollectionsSettings::route('/'),
        ];
    }
}
