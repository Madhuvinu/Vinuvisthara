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
                                null => 'Free (no crop)',
                                '16:9' => '16:9',
                                '21:9' => '21:9',
                            ])
                            ->imageEditorEmptyFillColor('#ffffff')
                            ->rules(function ($livewire) {
                                if (!isset($livewire->record) || !$livewire->record || !$livewire->record->exists) {
                                    return ['required'];
                                }
                                $imageUrl = $livewire->record->getRawOriginal('image_url') ?? null;
                                return empty($imageUrl) ? ['required'] : ['sometimes'];
                            })
                            ->live()
                            ->disk('public')
                            ->directory('slider-images')
                            ->visibility('public')
                            ->maxSize(5120) // 5MB
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('Upload any image. Use "Free (no crop)" to preserve full image. Adjust fit/position/zoom below.')
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
                        
                        Forms\Components\TextInput::make('banner_text')
                            ->label('Rat Banner Text')
                            ->placeholder('Bumper Offer 50% Off')
                            ->helperText('Text to display on the animated rat banner (e.g., Bumper Offer 50% Off, Special Discount, etc.)')
                            ->maxLength(100),
                        
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
                
                Forms\Components\Section::make('Image fit & position (Desktop/Tablet)')
                    ->description('Adjust how the image fits in the slider on desktop and tablet. Preview updates live.')
                    ->schema([
                        Forms\Components\Select::make('object_fit')
                            ->label('Fit')
                            ->options([
                                'contain' => 'Contain (no cropping - full image visible)',
                                'cover' => 'Cover (fill frame, may crop edges)',
                                'fill' => 'Fill (stretch to fill)',
                                'scale-down' => 'Scale down (contain or none)',
                            ])
                            ->default('contain')
                            ->live()
                            ->helperText('Use "Contain" to prevent cropping. Use zoom < 1 to fit entire image inside frame.')
                            ->required(),
                        Forms\Components\Select::make('object_position')
                            ->label('Position')
                            ->options([
                                'center' => 'Center',
                                'top' => 'Top',
                                'bottom' => 'Bottom',
                                'left' => 'Left',
                                'right' => 'Right',
                                'top left' => 'Top left',
                                'top right' => 'Top right',
                                'bottom left' => 'Bottom left',
                                'bottom right' => 'Bottom right',
                            ])
                            ->default('center')
                            ->live()
                            ->required(),
                        Forms\Components\TextInput::make('image_zoom')
                            ->label('Zoom')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.1)
                            ->default(1)
                            ->live()
                            ->suffix('×')
                            ->helperText('1 = normal. <1 = zoom out, >1 = zoom in.'),
                        Forms\Components\TextInput::make('image_scale_x')
                            ->label('Horizontal Stretch (Desktop)')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.05)
                            ->default(1)
                            ->live()
                            ->suffix('×')
                            ->helperText('Stretches the image left/right on desktop. 1 = normal. >1 = wider. This can distort the image.'),
                        Forms\Components\TextInput::make('image_scale_y')
                            ->label('Vertical Stretch (Desktop)')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.05)
                            ->default(1)
                            ->live()
                            ->suffix('×')
                            ->helperText('Stretches the image up/down on desktop. 1 = normal. >1 = taller. This can distort the image.'),
                        Forms\Components\View::make('filament.forms.slider-fit-preview')
                            ->viewData(fn ($get, $livewire) => [
                                'previewUrl' => method_exists($livewire, 'getSliderPreviewImageUrl')
                                    ? $livewire->getSliderPreviewImageUrl()
                                    : null,
                                'objectFit' => $get('object_fit') ?? 'cover',
                                'objectPosition' => $get('object_position') ?? 'center',
                                'zoom' => (float) ($get('image_zoom') ?? 1),
                                'scaleX' => (float) ($get('image_scale_x') ?? 1),
                                'scaleY' => (float) ($get('image_scale_y') ?? 1),
                            ])
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
                    ->collapsible(),
                
                Forms\Components\Section::make('Mobile View Settings')
                    ->description('Override settings specifically for mobile devices (< 640px). Leave empty to use desktop settings.')
                    ->schema([
                        Forms\Components\FileUpload::make('mobile_image_url')
                            ->label('Mobile Image (Optional)')
                            ->image()
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                null => 'Free (no crop)',
                                '3:2' => '3:2 (Recommended for mobile)',
                                '16:9' => '16:9',
                                '21:9' => '21:9',
                            ])
                            ->imageEditorEmptyFillColor('#ffffff')
                            ->rules(function ($livewire) {
                                // Enforce separate mobile image on create, and also on edit if missing.
                                if (!isset($livewire->record) || !$livewire->record || !$livewire->record->exists) {
                                    return ['required'];
                                }
                                $mobileImageUrl = $livewire->record->getRawOriginal('mobile_image_url') ?? null;
                                return empty($mobileImageUrl) ? ['required'] : ['sometimes'];
                            })
                            ->live()
                            ->disk('public')
                            ->directory('slider-images/mobile')
                            ->visibility('public')
                            ->maxSize(5120) // 5MB
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('Required: Upload a separate image for mobile. Recommended size: 1080×720 (3:2). Keep key content centered.')
                            ->columnSpanFull(),
                        
                        Forms\Components\TextInput::make('mobile_height')
                            ->label('Mobile Height')
                            ->rules(['nullable', 'numeric', 'min:20', 'max:1000'])
                            ->suffix('px')
                            ->default(null)
                            ->placeholder('Auto (use aspect ratio)')
                            ->helperText('Set fixed height in pixels for mobile (20-1000px). Leave empty for automatic height based on aspect ratio.'),
                        
                        Forms\Components\Select::make('mobile_object_fit')
                            ->label('Mobile Fit')
                            ->options([
                                'cover' => 'Cover (recommended - fills container)',
                                'contain' => 'Contain (no cropping)',
                                'fill' => 'Fill (stretch)',
                                'scale-down' => 'Scale down',
                            ])
                            ->default(null)
                            ->placeholder('Use desktop setting')
                            ->helperText('Mobile-specific object-fit. "Cover" is recommended for mobile to fill the container properly.')
                            ->live(),
                        
                        Forms\Components\Select::make('mobile_object_position')
                            ->label('Mobile Position')
                            ->options([
                                'center center' => 'Center Center (recommended)',
                                'center' => 'Center',
                                'top' => 'Top',
                                'bottom' => 'Bottom',
                                'left' => 'Left',
                                'right' => 'Right',
                                'top left' => 'Top Left',
                                'top right' => 'Top Right',
                                'bottom left' => 'Bottom Left',
                                'bottom right' => 'Bottom Right',
                                'left center' => 'Left Center',
                                'right center' => 'Right Center',
                            ])
                            ->default(null)
                            ->placeholder('Use desktop setting')
                            ->helperText('Mobile-specific image position. "Center Center" is recommended for mobile.')
                            ->live(),
                        
                        Forms\Components\TextInput::make('mobile_image_zoom')
                            ->label('Mobile Zoom')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.1)
                            ->default(null)
                            ->placeholder('Use desktop zoom')
                            ->suffix('×')
                            ->helperText('Mobile-specific zoom. Usually keep at 1.0 for mobile to show complete image.'),

                        Forms\Components\TextInput::make('mobile_image_scale_x')
                            ->label('Mobile Horizontal Stretch')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.05)
                            ->default(1)
                            ->live()
                            ->suffix('×')
                            ->helperText('Stretches the image left/right on mobile. 1 = normal. >1 = wider. This can distort the image.'),

                        Forms\Components\TextInput::make('mobile_image_scale_y')
                            ->label('Mobile Vertical Stretch')
                            ->numeric()
                            ->minValue(0.5)
                            ->maxValue(2)
                            ->step(0.05)
                            ->default(1)
                            ->live()
                            ->suffix('×')
                            ->helperText('Stretches the image up/down on mobile. 1 = normal. >1 = taller. This can distort the image.'),
                        
                        Forms\Components\View::make('filament.forms.slider-mobile-preview')
                            ->viewData(fn ($get, $livewire) => [
                                'previewUrl' => method_exists($livewire, 'getSliderPreviewImageUrl')
                                    ? $livewire->getSliderPreviewImageUrl()
                                    : null,
                                'mobilePreviewUrl' => method_exists($livewire, 'getMobilePreviewImageUrl')
                                    ? $livewire->getMobilePreviewImageUrl()
                                    : null,
                                'objectFit' => $get('mobile_object_fit') ?? ($get('object_fit') ?? 'cover'),
                                'objectPosition' => $get('mobile_object_position') ?? ($get('object_position') ?? 'center center'),
                                'zoom' => (float) ($get('mobile_image_zoom') ?? $get('image_zoom') ?? 1),
                                'scaleX' => (float) ($get('mobile_image_scale_x') ?? 1),
                                'scaleY' => (float) ($get('mobile_image_scale_y') ?? 1),
                                'mobileHeight' => $get('mobile_height'),
                            ])
                            ->columnSpanFull(),
                        
                        Forms\Components\Section::make('Mobile Padding')
                            ->description('Add padding inside the slider container on mobile')
                            ->schema([
                                Forms\Components\TextInput::make('mobile_padding_top')
                                    ->label('Padding Top')
                                    ->numeric()
                                    ->minValue(0)
                                    ->maxValue(200)
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Padding from top edge'),
                                
                                Forms\Components\TextInput::make('mobile_padding_right')
                                    ->label('Padding Right')
                                    ->numeric()
                                    ->minValue(0)
                                    ->maxValue(200)
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Padding from right edge'),
                                
                                Forms\Components\TextInput::make('mobile_padding_bottom')
                                    ->label('Padding Bottom')
                                    ->numeric()
                                    ->minValue(0)
                                    ->maxValue(200)
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Padding from bottom edge'),
                                
                                Forms\Components\TextInput::make('mobile_padding_left')
                                    ->label('Padding Left')
                                    ->numeric()
                                    ->minValue(0)
                                    ->maxValue(200)
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Padding from left edge'),
                            ])
                            ->columns(2)
                            ->collapsible()
                            ->collapsed(),
                        
                        Forms\Components\Section::make('Mobile Margin & Positioning')
                            ->description('Adjust margins to move slider up/down/left/right. Use negative values to move up/left and cover white space.')
                            ->schema([
                                Forms\Components\TextInput::make('mobile_margin_top')
                                    ->label('Margin Top')
                                    ->numeric()
                                    ->rules(['nullable', 'numeric', 'min:-200', 'max:200'])
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Negative values move slider UP to cover top white space. Positive adds space.'),
                                
                                Forms\Components\TextInput::make('mobile_margin_right')
                                    ->label('Margin Right')
                                    ->numeric()
                                    ->rules(['nullable', 'numeric', 'min:-200', 'max:200'])
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Negative values move slider LEFT. Positive adds space.'),
                                
                                Forms\Components\TextInput::make('mobile_margin_bottom')
                                    ->label('Margin Bottom')
                                    ->numeric()
                                    ->rules(['nullable', 'numeric', 'min:-200', 'max:200'])
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Negative values move slider UP. Positive adds space.'),
                                
                                Forms\Components\TextInput::make('mobile_margin_left')
                                    ->label('Margin Left')
                                    ->numeric()
                                    ->rules(['nullable', 'numeric', 'min:-200', 'max:200'])
                                    ->default(0)
                                    ->suffix('px')
                                    ->helperText('Negative values move slider RIGHT. Positive adds space.'),
                                
                                Forms\Components\Toggle::make('mobile_full_width')
                                    ->label('Full Width (Remove Side Margins)')
                                    ->default(false)
                                    ->helperText('Enable to make slider span full screen width, removing side margins/padding.')
                                    ->columnSpanFull(),
                            ])
                            ->columns(2)
                            ->collapsible(),
                    ])
                    ->columns(2)
                    ->collapsible(),
                
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
