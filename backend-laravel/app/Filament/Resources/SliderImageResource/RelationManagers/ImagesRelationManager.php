<?php

namespace App\Filament\Resources\SliderImageResource\RelationManagers;

use App\Models\SliderImageItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    protected static ?string $recordTitleAttribute = 'image_url';
    
    protected static ?string $model = SliderImageItem::class;

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\FileUpload::make('image_url')
                    ->label('Image')
                    ->image()
                    ->directory('slider-images/items')
                    ->visibility('public')
                    ->imageEditor()
                    ->imageEditorAspectRatios([
                        null, '16:9', '21:9', '4:3', '1:1',
                    ])
                    ->required()
                    ->maxSize(5120) // 5MB
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                    ->helperText('Upload additional images for layered Polaroid effect'),
                Forms\Components\TextInput::make('order')
                    ->label('Display Order')
                    ->numeric()
                    ->default(0)
                    ->required()
                    ->helperText('Lower numbers appear first. Use this to control layering order.'),
                Forms\Components\Toggle::make('is_primary')
                    ->label('Primary Image')
                    ->helperText('Mark this as the primary image (shown first)')
                    ->default(false),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('image_url')
            ->columns([
                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Image')
                    ->size(80)
                    ->circular(),
                Tables\Columns\TextColumn::make('order')
                    ->label('Order')
                    ->sortable()
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('is_primary')
                    ->label('Primary')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('order', 'asc');
    }
}
