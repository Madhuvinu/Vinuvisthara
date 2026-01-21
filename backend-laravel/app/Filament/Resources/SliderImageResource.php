<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SliderImageResource\Pages;
use App\Filament\Resources\SliderImageResource\RelationManagers;
use App\Models\SliderImage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SliderImageResource extends Resource
{
    protected static ?string $model = SliderImage::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';
    
    protected static ?string $navigationLabel = 'Slider Images';
    
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Image Details')
                    ->schema([
                        Forms\Components\FileUpload::make('image_url')
                            ->label('Slider Image')
                            ->image()
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '21:9',
                            ])
                            ->required()
                            ->disk('public')
                            ->directory('slider-images')
                            ->visibility('public')
                            ->maxSize(5120) // 5MB
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->columnSpanFull(),
                        
                        Forms\Components\TextInput::make('title')
                            ->maxLength(255),
                        
                        Forms\Components\Textarea::make('description')
                            ->rows(3)
                            ->columnSpanFull(),
                        
                        Forms\Components\TextInput::make('link')
                            ->label('Link URL')
                            ->url()
                            ->placeholder('https://example.com'),
                        
                        Forms\Components\TextInput::make('button_text')
                            ->label('Button Text')
                            ->placeholder('Shop Now')
                            ->helperText('Text to display on the button (e.g., Shop Now, Explore, Learn More)')
                            ->maxLength(50),
                        
                        Forms\Components\ColorPicker::make('button_text_color')
                            ->label('Button Text Color')
                            ->placeholder('#000000')
                            ->helperText('Text color for the button (e.g., #000000 for black, #ffffff for white)'),
                        
                        Forms\Components\ColorPicker::make('button_background_color')
                            ->label('Button Background Color')
                            ->placeholder('#ffffff')
                            ->helperText('Background color for the button (e.g., #ffffff for white, #000000 for black)'),
                        
                        Forms\Components\ColorPicker::make('gradient_color_1')
                            ->label('Gradient Color 1')
                            ->placeholder('#ffffff')
                            ->helperText('First color for gradient background'),
                        
                        Forms\Components\ColorPicker::make('gradient_color_2')
                            ->label('Gradient Color 2')
                            ->placeholder('#e0e7ff')
                            ->helperText('Second color for gradient background'),
                        
                        Forms\Components\ColorPicker::make('gradient_color_3')
                            ->label('Gradient Color 3')
                            ->placeholder('#f3e8ff')
                            ->helperText('Third color for gradient background'),
                        
                        Forms\Components\ColorPicker::make('text_color')
                            ->label('Text Color')
                            ->placeholder('#000000')
                            ->helperText('Text color for title and description (e.g., #000000, #ffffff)'),
                        
                        Forms\Components\ColorPicker::make('header_color')
                            ->label('Header Color')
                            ->placeholder('#1f2937')
                            ->helperText('Background color for the header/navbar when this slider is active'),
                    ])->columns(2),
                
                Forms\Components\Section::make('Card Background Settings')
                    ->description('Control the background colors of the hero image card')
                    ->schema([
                        Forms\Components\ColorPicker::make('card_background_color')
                            ->label('Card Outer Background Color')
                            ->placeholder('#ffffff')
                            ->helperText('Solid background color for the outer hero card. Default: soft frosted-glass white. Use dark colors (e.g., #0e3a46) for night theme.'),
                        
                        Forms\Components\Textarea::make('card_background_gradient')
                            ->label('Card Outer Background Gradient (Optional)')
                            ->rows(2)
                            ->placeholder('linear-gradient(145deg, rgba(255,255,255,0.85), rgba(230,240,255,0.85))')
                            ->helperText('CSS gradient string for outer card. If provided, this will override the solid color. Example: linear-gradient(135deg, #0e3a46, #124f5c)')
                            ->columnSpanFull(),
                        
                        Forms\Components\ColorPicker::make('image_inner_background')
                            ->label('Image Inner Background')
                            ->placeholder('#ffffff')
                            ->helperText('Background color for the inner frame (behind the image). Default: white (#ffffff). Use warm tones (e.g., #f8f1ea) or dark colors (e.g., #0e3a46) to match your theme.')
                            ->columnSpanFull(),
                    ])->columns(2)->collapsible()->collapsed(),
                
                Forms\Components\Section::make('Settings')
                    ->schema([
                        Forms\Components\TextInput::make('order')
                            ->label('Display Order')
                            ->numeric()
                            ->default(0)
                            ->required()
                            ->helperText('Lower numbers appear first. Use this to control the order of sliders.'),
                        
                        Forms\Components\Toggle::make('is_active')
                            ->label('Enable Slider')
                            ->helperText('When enabled, this slider will be displayed on the frontend. When disabled, it will be hidden.')
                            ->default(true)
                            ->required()
                            ->inline(false)
                            ->columnSpanFull(),
                        
                        Forms\Components\Toggle::make('sparkle_effect_enabled')
                            ->label('Enable Sparkle Effect')
                            ->helperText('Enable subtle moving stars/sparkles effect. Very subtle luxury brand vibe - tiny dots moving diagonally like wind.')
                            ->default(true)
                            ->required()
                            ->inline(false)
                            ->live()
                            ->columnSpanFull(),
                        
                        Forms\Components\ColorPicker::make('sparkle_color')
                            ->label('Sparkle Color')
                            ->default('#ffffff')
                            ->helperText('Color of the sparkle stars (default: white)')
                            ->visible(fn (Forms\Get $get) => $get('sparkle_effect_enabled')),
                        
                        Forms\Components\TextInput::make('sparkle_speed')
                            ->label('Sparkle Speed')
                            ->numeric()
                            ->default(15)
                            ->minValue(8)
                            ->maxValue(30)
                            ->suffix('seconds')
                            ->helperText('Animation duration in seconds. Lower = faster (8-30 seconds)')
                            ->visible(fn (Forms\Get $get) => $get('sparkle_effect_enabled')),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Image')
                    ->circular()
                    ->size(60),
                
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('order')
                    ->sortable()
                    ->label('Order'),
                
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->sortable()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->tooltip(fn ($record): string => $record->is_active ? 'Enabled - Visible on frontend' : 'Disabled - Hidden from frontend'),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active')
                    ->placeholder('All')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('order');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ImagesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSliderImages::route('/'),
            'create' => Pages\CreateSliderImage::route('/create'),
            'view' => Pages\ViewSliderImage::route('/{record}'),
            'edit' => Pages\EditSliderImage::route('/{record}/edit'),
        ];
    }
}
