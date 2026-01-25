<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShippingSettingsResource\Pages;
use App\Models\ShippingSettings;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ShippingSettingsResource extends Resource
{
    protected static ?string $model = ShippingSettings::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationLabel = 'Shipping Settings';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $slug = 'shipping-settings';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->default('Default Shipping')
                    ->helperText('Name for this shipping configuration'),
                
                Forms\Components\Select::make('type')
                    ->label('Shipping Type')
                    ->options([
                        'flat_rate' => 'Flat Rate',
                        'free_shipping_threshold' => 'Free Shipping Above Threshold',
                        'weight_based' => 'Weight Based',
                        'distance_based' => 'Distance Based',
                    ])
                    ->required()
                    ->default('free_shipping_threshold')
                    ->live()
                    ->helperText('Select how shipping cost is calculated'),
                
                Forms\Components\Section::make('Flat Rate Settings')
                    ->schema([
                        Forms\Components\TextInput::make('flat_rate_amount')
                            ->label('Flat Rate Amount (₹)')
                            ->numeric()
                            ->default(100)
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Fixed shipping charge for all orders')
                            ->visible(fn (Forms\Get $get) => in_array($get('type'), ['flat_rate', 'free_shipping_threshold'])),
                    ])
                    ->visible(fn (Forms\Get $get) => in_array($get('type'), ['flat_rate', 'free_shipping_threshold']))
                    ->collapsible(),
                
                Forms\Components\Section::make('Free Shipping Threshold')
                    ->schema([
                        Forms\Components\TextInput::make('free_shipping_threshold')
                            ->label('Free Shipping Above (₹)')
                            ->numeric()
                            ->default(999)
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Orders above this amount get free shipping')
                            ->visible(fn (Forms\Get $get) => $get('type') === 'free_shipping_threshold'),
                    ])
                    ->visible(fn (Forms\Get $get) => $get('type') === 'free_shipping_threshold')
                    ->collapsible(),
                
                Forms\Components\Section::make('Weight Based Settings')
                    ->schema([
                        Forms\Components\TextInput::make('weight_rate_per_kg')
                            ->label('Rate Per Kg (₹)')
                            ->numeric()
                            ->default(50)
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Shipping cost per kilogram')
                            ->visible(fn (Forms\Get $get) => $get('type') === 'weight_based'),
                    ])
                    ->visible(fn (Forms\Get $get) => $get('type') === 'weight_based')
                    ->collapsible(),
                
                Forms\Components\Section::make('Distance Based Settings')
                    ->schema([
                        Forms\Components\TextInput::make('distance_rate_per_km')
                            ->label('Rate Per Km (₹)')
                            ->numeric()
                            ->default(5)
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Shipping cost per kilometer')
                            ->visible(fn (Forms\Get $get) => $get('type') === 'distance_based'),
                    ])
                    ->visible(fn (Forms\Get $get) => $get('type') === 'distance_based')
                    ->collapsible(),
                
                Forms\Components\Section::make('Shipping Limits')
                    ->schema([
                        Forms\Components\TextInput::make('min_shipping_charge')
                            ->label('Minimum Shipping Charge (₹)')
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Minimum shipping charge (even if calculated amount is lower)'),
                        
                        Forms\Components\TextInput::make('max_shipping_charge')
                            ->label('Maximum Shipping Charge (₹)')
                            ->numeric()
                            ->minValue(0)
                            ->prefix('₹')
                            ->helperText('Maximum shipping charge (leave empty for no limit)')
                            ->nullable(),
                    ])
                    ->collapsible()
                    ->collapsed(),
                
                Forms\Components\Section::make('Location Restrictions')
                    ->schema([
                        Forms\Components\TagsInput::make('applicable_states')
                            ->label('Applicable States')
                            ->placeholder('Enter state names (e.g., Maharashtra, Karnataka)')
                            ->helperText('Leave empty to apply to all states. Enter specific states to restrict shipping.')
                            ->nullable(),
                        
                        Forms\Components\TagsInput::make('applicable_cities')
                            ->label('Applicable Cities')
                            ->placeholder('Enter city names (e.g., Mumbai, Bangalore)')
                            ->helperText('Leave empty to apply to all cities. Enter specific cities to restrict shipping.')
                            ->nullable(),
                    ])
                    ->collapsible()
                    ->collapsed(),
                
                Forms\Components\Toggle::make('is_active')
                    ->label('Is Active')
                    ->default(true)
                    ->helperText('Enable or disable this shipping configuration'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match($state) {
                        'flat_rate' => 'Flat Rate',
                        'free_shipping_threshold' => 'Free Above Threshold',
                        'weight_based' => 'Weight Based',
                        'distance_based' => 'Distance Based',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match($state) {
                        'flat_rate' => 'info',
                        'free_shipping_threshold' => 'success',
                        'weight_based' => 'warning',
                        'distance_based' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('flat_rate_amount')
                    ->label('Flat Rate')
                    ->money('INR')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('free_shipping_threshold')
                    ->label('Free Above')
                    ->money('INR')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
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
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'flat_rate' => 'Flat Rate',
                        'free_shipping_threshold' => 'Free Shipping Above Threshold',
                        'weight_based' => 'Weight Based',
                        'distance_based' => 'Distance Based',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active')
                    ->placeholder('All')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
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
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShippingSettings::route('/'),
            'create' => Pages\CreateShippingSettings::route('/create'),
            'edit' => Pages\EditShippingSettings::route('/{record}/edit'),
        ];
    }
}
