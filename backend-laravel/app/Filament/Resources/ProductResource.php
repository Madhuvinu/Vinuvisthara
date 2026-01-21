<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

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
                Forms\Components\Textarea::make('short_description')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('sku')
                    ->label('SKU')
                    ->maxLength(255),
                Forms\Components\TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('₹'),
                Forms\Components\TextInput::make('compare_at_price')
                    ->numeric(),
                
                Forms\Components\TextInput::make('tax_rate')
                    ->label('Tax Rate (GST %)')
                    ->numeric()
                    ->default(18.00)
                    ->minValue(0)
                    ->maxValue(100)
                    ->suffix('%')
                    ->helperText('GST tax rate for this product (e.g., 18 for 18% GST)')
                    ->required(),
                
                Forms\Components\Section::make('Discount & Offers')
                    ->description('Set discounts and special offers for this product')
                    ->schema([
                        Forms\Components\Toggle::make('has_discount')
                            ->label('Enable Discount')
                            ->default(false)
                            ->live()
                            ->helperText('Enable to apply discount to this product'),
                        
                        Forms\Components\TextInput::make('discount_percentage')
                            ->label('Discount Percentage')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('%')
                            ->visible(fn (Forms\Get $get) => $get('has_discount'))
                            ->helperText('Percentage discount (e.g., 20 for 20% off)'),
                        
                        Forms\Components\TextInput::make('discount_amount')
                            ->label('Discount Amount (₹)')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('₹')
                            ->visible(fn (Forms\Get $get) => $get('has_discount'))
                            ->helperText('Fixed amount discount in rupees'),
                        
                        Forms\Components\DateTimePicker::make('discount_starts_at')
                            ->label('Discount Start Date')
                            ->visible(fn (Forms\Get $get) => $get('has_discount')),
                        
                        Forms\Components\DateTimePicker::make('discount_ends_at')
                            ->label('Discount End Date')
                            ->visible(fn (Forms\Get $get) => $get('has_discount')),
                        
                        Forms\Components\TextInput::make('offer_text')
                            ->label('Offer Text')
                            ->maxLength(255)
                            ->placeholder('e.g., "Buy 2 Get 1 Free", "50% Off", "Limited Time Offer"')
                            ->helperText('Special offer text displayed on product card'),
                    ])
                    ->columns(2)
                    ->collapsible()
                    ->collapsed(),
                
                Forms\Components\TextInput::make('stock')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\TextInput::make('low_stock_threshold')
                    ->required()
                    ->numeric()
                    ->default(5),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'out_of_stock' => 'Out of Stock',
                    ])
                    ->default('draft')
                    ->required(),
                Forms\Components\Toggle::make('is_featured')
                    ->required(),
                Forms\Components\FileUpload::make('thumbnail')
                    ->label('Thumbnail Image')
                    ->image()
                    ->directory('products/thumbnails')
                    ->visibility('public')
                    ->imageEditor()
                    ->imageEditorAspectRatios([
                        null,
                        '16:9',
                        '4:3',
                        '1:1',
                    ])
                    ->helperText('Main product thumbnail image (shown in product listings)')
                    ->maxSize(5120) // 5MB
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp']),
                Forms\Components\Select::make('category_id')
                    ->relationship('category', 'name'),
                Forms\Components\Select::make('collection_id')
                    ->relationship('collection', 'name'),
                Forms\Components\TextInput::make('metadata'),
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
                Tables\Columns\TextColumn::make('sku')
                    ->label('SKU')
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('compare_at_price')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('tax_rate')
                    ->label('Tax Rate')
                    ->numeric()
                    ->suffix('%')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\IconColumn::make('has_discount')
                    ->label('Discount')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('discount_percentage')
                    ->label('Discount %')
                    ->numeric()
                    ->suffix('%')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('offer_text')
                    ->label('Offer')
                    ->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('stock')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('low_stock_threshold')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status'),
                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean(),
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->label('Thumbnail')
                    ->circular()
                    ->size(50),
                Tables\Columns\TextColumn::make('category.name')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('collection.name')
                    ->numeric()
                    ->sortable(),
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
            RelationManagers\ProductImagesRelationManager::class,
            RelationManagers\ProductReviewsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'view' => Pages\ViewProduct::route('/{record}'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
