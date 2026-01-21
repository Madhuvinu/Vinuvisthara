<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductReviewResource\Pages;
use App\Filament\Resources\ProductReviewResource\RelationManagers;
use App\Models\ProductReview;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductReviewResource extends Resource
{
    protected static ?string $model = ProductReview::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationGroup = 'Shop';
    protected static ?string $navigationLabel = 'Product Reviews';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('product_id')
                    ->relationship('product', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('customer_id')
                    ->relationship('customer', 'email')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('customer_name')
                    ->label('Display Name')
                    ->maxLength(255)
                    ->helperText('Name to display with review (defaults to customer email)'),
                Forms\Components\Select::make('rating')
                    ->label('Rating')
                    ->options([
                        1 => '1 Star',
                        2 => '2 Stars',
                        3 => '3 Stars',
                        4 => '4 Stars',
                        5 => '5 Stars',
                    ])
                    ->required()
                    ->default(5),
                Forms\Components\Textarea::make('comment')
                    ->label('Review Comment')
                    ->rows(4)
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_approved')
                    ->label('Approved')
                    ->default(false)
                    ->helperText('Only approved reviews are shown on frontend'),
                Forms\Components\Toggle::make('is_featured')
                    ->label('Featured')
                    ->default(false)
                    ->helperText('Featured reviews appear first'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Product')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.email')
                    ->label('Customer')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer_name')
                    ->label('Display Name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Rating')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        '5' => 'success',
                        '4' => 'success',
                        '3' => 'warning',
                        '2' => 'danger',
                        '1' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str_repeat('⭐', (int)$state))
                    ->sortable(),
                Tables\Columns\TextColumn::make('comment')
                    ->label('Review')
                    ->limit(50)
                    ->wrap(),
                Tables\Columns\IconColumn::make('is_approved')
                    ->label('Approved')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\Filter::make('is_approved')
                    ->label('Approved Only')
                    ->query(fn (Builder $query): Builder => $query->where('is_approved', true)),
                Tables\Filters\SelectFilter::make('rating')
                    ->options([
                        5 => '5 Stars',
                        4 => '4 Stars',
                        3 => '3 Stars',
                        2 => '2 Stars',
                        1 => '1 Star',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(fn (ProductReview $record) => $record->update(['is_approved' => true])),
                Tables\Actions\Action::make('unapprove')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(fn (ProductReview $record) => $record->update(['is_approved' => false])),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListProductReviews::route('/'),
            'create' => Pages\CreateProductReview::route('/create'),
            'edit' => Pages\EditProductReview::route('/{record}/edit'),
        ];
    }
}
