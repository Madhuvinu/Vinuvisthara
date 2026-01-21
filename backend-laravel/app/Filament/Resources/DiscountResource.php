<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DiscountResource\Pages;
use App\Filament\Resources\DiscountResource\RelationManagers;
use App\Models\Discount;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DiscountResource extends Resource
{
    protected static ?string $model = Discount::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';
    protected static ?string $navigationGroup = 'Shop';
    protected static ?string $navigationLabel = 'Discounts';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('code')
                    ->maxLength(255),
                Forms\Components\Select::make('type')
                    ->label('Discount Type')
                    ->options([
                        'percentage' => 'Percentage',
                        'fixed' => 'Fixed Amount',
                    ])
                    ->required()
                    ->default('percentage'),
                Forms\Components\TextInput::make('value')
                    ->label('Discount Value')
                    ->required()
                    ->numeric()
                    ->helperText('Percentage (e.g., 20) or Fixed Amount (e.g., 500)'),
                Forms\Components\TextInput::make('min_order_amount')
                    ->numeric(),
                Forms\Components\TextInput::make('max_discount_amount')
                    ->numeric(),
                Forms\Components\Select::make('apply_to')
                    ->label('Apply To')
                    ->options([
                        'all' => 'All Products',
                        'categories' => 'Specific Categories',
                        'products' => 'Specific Products',
                        'collections' => 'Specific Collections',
                    ])
                    ->required()
                    ->default('all')
                    ->live(),
                Forms\Components\Textarea::make('apply_to_ids')
                    ->label('Item IDs (JSON)')
                    ->visible(fn (Forms\Get $get) => in_array($get('apply_to'), ['categories', 'products', 'collections']))
                    ->helperText('Enter IDs as JSON array, e.g., [1, 2, 3]')
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_active')
                    ->required(),
                Forms\Components\DateTimePicker::make('starts_at'),
                Forms\Components\DateTimePicker::make('ends_at'),
                Forms\Components\TextInput::make('usage_limit')
                    ->numeric(),
                Forms\Components\TextInput::make('usage_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('first_time_customer_only')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type'),
                Tables\Columns\TextColumn::make('value')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('min_order_amount')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('max_discount_amount')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('apply_to'),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('starts_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('ends_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('usage_limit')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('usage_count')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\IconColumn::make('first_time_customer_only')
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
            'index' => Pages\ListDiscounts::route('/'),
            'create' => Pages\CreateDiscount::route('/create'),
            'edit' => Pages\EditDiscount::route('/{record}/edit'),
        ];
    }
}
