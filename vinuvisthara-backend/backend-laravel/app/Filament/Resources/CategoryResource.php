<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Filament\Resources\CategoryResource\RelationManagers;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
                Forms\Components\FileUpload::make('image')
                    ->label('Category Image')
                    ->image()
                    ->directory('categories')
                    ->visibility('public')
                    ->imageEditor()
                    ->imageEditorAspectRatios([
                        null,
                        '16:9',
                        '4:3',
                        '1:1',
                    ])
                    ->helperText('Category banner/image displayed on category pages and listings')
                    ->maxSize(5120) // 5MB
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp']),
                
                Forms\Components\Section::make('Display Settings')
                    ->description('Control how this category appears in the "Our Collections" section')
                    ->schema([
                        Forms\Components\Select::make('aspect_ratio')
                            ->label('Aspect Ratio')
                            ->options([
                                '1:1' => 'Square (1:1)',
                                '4:3' => 'Standard (4:3)',
                                '16:9' => 'Widescreen (16:9)',
                                '4:5' => 'Portrait (4:5)',
                                '3:4' => 'Tall Portrait (3:4)',
                            ])
                            ->default('4:5')
                            ->helperText('Card aspect ratio (width:height)'),
                        
                        Forms\Components\Select::make('image_fit')
                            ->label('Image Fit')
                            ->options([
                                'cover' => 'Cover (fill container, may crop)',
                                'contain' => 'Contain (fit entire image, may show gaps)',
                                'fill' => 'Fill (stretch to fill, may distort)',
                                'none' => 'None (original size)',
                            ])
                            ->default('cover')
                            ->helperText('How the image should fit in the card'),
                        
                        Forms\Components\Select::make('image_position')
                            ->label('Image Position (Legacy)')
                            ->options([
                                'center' => 'Center',
                                'top' => 'Top',
                                'bottom' => 'Bottom',
                                'left' => 'Left',
                                'right' => 'Right',
                                'top left' => 'Top Left',
                                'top right' => 'Top Right',
                                'bottom left' => 'Bottom Left',
                                'bottom right' => 'Bottom Right',
                            ])
                            ->default('center')
                            ->helperText('Basic position (use alignment options below for more control)'),
                        
                        Forms\Components\Section::make('Advanced Image Alignment')
                            ->description('Fine-tune how the image fits and aligns inside the card')
                            ->schema([
                                Forms\Components\Select::make('image_align_horizontal')
                                    ->label('Horizontal Alignment')
                                    ->options([
                                        'left' => 'Left',
                                        'center' => 'Center',
                                        'right' => 'Right',
                                    ])
                                    ->default('center')
                                    ->helperText('Align image left, center, or right'),
                                
                                Forms\Components\Select::make('image_align_vertical')
                                    ->label('Vertical Alignment')
                                    ->options([
                                        'top' => 'Top',
                                        'center' => 'Center',
                                        'bottom' => 'Bottom',
                                    ])
                                    ->default('center')
                                    ->helperText('Align image top, center, or bottom'),
                                
                                Forms\Components\TextInput::make('image_scale')
                                    ->label('Image Scale/Zoom')
                                    ->numeric()
                                    ->default(1.0)
                                    ->minValue(0.5)
                                    ->maxValue(2.0)
                                    ->step(0.1)
                                    ->helperText('Zoom level: 0.5 = zoomed out, 1.0 = normal, 2.0 = zoomed in'),
                                
                                Forms\Components\TextInput::make('image_offset_x')
                                    ->label('Horizontal Offset (px)')
                                    ->numeric()
                                    ->default(0)
                                    ->minValue(-100)
                                    ->maxValue(100)
                                    ->suffix('px')
                                    ->helperText('Shift image left (-) or right (+)'),
                                
                                Forms\Components\TextInput::make('image_offset_y')
                                    ->label('Vertical Offset (px)')
                                    ->numeric()
                                    ->default(0)
                                    ->minValue(-100)
                                    ->maxValue(100)
                                    ->suffix('px')
                                    ->helperText('Shift image up (-) or down (+)'),
                            ])
                            ->columns(2)
                            ->collapsible()
                            ->collapsed(),
                        
                        Forms\Components\TextInput::make('spacing')
                            ->label('Spacing (px)')
                            ->numeric()
                            ->default(16)
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('px')
                            ->helperText('Spacing around the card in pixels'),
                    ])
                    ->columns(2)
                    ->collapsible()
                    ->collapsed(),
                
                Forms\Components\Select::make('parent_id')
                    ->relationship('parent', 'name'),
                Forms\Components\TextInput::make('order')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('is_active')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\ImageColumn::make('image'),
                Tables\Columns\TextColumn::make('parent.name')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('order')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'view' => Pages\ViewCategory::route('/{record}'),
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
