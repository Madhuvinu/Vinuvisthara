<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use App\Mail\OrderShippedMail;
use App\Services\ShiprocketService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Mail;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('order_number')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('customer_id')
                    ->relationship('customer', 'email')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->helperText('Select the customer for this order'),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                        'refunded' => 'Refunded',
                    ])
                    ->required(),
                Forms\Components\Select::make('fulfillment_status')
                    ->label('Fulfillment Status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'picked' => 'Picked',
                        'packed' => 'Packed',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('tracking_number')
                    ->maxLength(255),
                Forms\Components\TextInput::make('carrier')
                    ->maxLength(255),
                Forms\Components\TextInput::make('payment_status')
                    ->required(),
                Forms\Components\TextInput::make('subtotal')
                    ->required()
                    ->numeric(),
                Forms\Components\TextInput::make('tax')
                    ->required()
                    ->numeric()
                    ->default(0.00),
                Forms\Components\TextInput::make('shipping')
                    ->required()
                    ->numeric()
                    ->default(0.00),
                Forms\Components\TextInput::make('discount')
                    ->required()
                    ->numeric()
                    ->default(0.00),
                Forms\Components\TextInput::make('total')
                    ->required()
                    ->numeric(),
                Forms\Components\TextInput::make('coupon_code')
                    ->maxLength(255),
                Forms\Components\KeyValue::make('shipping_address')
                    ->label('Shipping Address')
                    ->helperText('Address details (address, city, state, pincode, phone, email)')
                    ->keyLabel('Field')
                    ->valueLabel('Value'),
                Forms\Components\KeyValue::make('billing_address')
                    ->label('Billing Address')
                    ->helperText('Billing address details (optional)')
                    ->keyLabel('Field')
                    ->valueLabel('Value'),
                Forms\Components\Textarea::make('notes')
                    ->columnSpanFull(),
                Forms\Components\DateTimePicker::make('shipped_at'),
                Forms\Components\DateTimePicker::make('delivered_at'),
                Forms\Components\TextInput::make('shiprocket_order_id')->label('Shiprocket Order ID')->disabled(),
                Forms\Components\TextInput::make('shiprocket_shipment_id')->label('Shiprocket Shipment ID')->disabled(),
                Forms\Components\TextInput::make('shiprocket_awb')->label('Shiprocket AWB')->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->label('Order #')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Order Date & Time')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('customer.email')
                    ->label('Customer')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'processing' => 'info',
                        'shipped' => 'warning',
                        'delivered' => 'success',
                        'cancelled' => 'danger',
                        'refunded' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('fulfillment_status')
                    ->label('Fulfillment')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'processing' => 'info',
                        'picked' => 'warning',
                        'packed' => 'primary',
                        'shipped' => 'success',
                        'delivered' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('tracking_number')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('shiprocket_order_id')
                    ->label('Shiprocket')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('payment_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('subtotal')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('tax')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('shipping')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('discount')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('total')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('coupon_code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Order Date')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('shipped_at')
                    ->label('Shipped At')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('delivered_at')
                    ->label('Delivered At')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                // Push to Shiprocket (create order + assign AWB)
                Tables\Actions\Action::make('pushToShiprocket')
                    ->label('Push to Shiprocket')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Create order on Shiprocket and assign AWB')
                    ->visible(fn (Order $record) => ! $record->shiprocket_order_id && in_array($record->fulfillment_status, ['pending', 'processing']))
                    ->action(function (Order $record) {
                        $service = app(ShiprocketService::class);
                        if (! $service->isConfigured()) {
                            Notification::make()->title('Shiprocket not configured')->body('Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env')->danger()->send();
                            return;
                        }
                        try {
                            $data = $service->createOrderAndAssignAwb($record);
                            $record->update(array_merge($data, [
                                'tracking_number' => $data['shiprocket_awb'],
                                'carrier' => $data['carrier'] ?? $record->carrier,
                                'fulfillment_status' => $record->fulfillment_status === 'pending' ? 'processing' : $record->fulfillment_status,
                                'processed_at' => $record->fulfillment_status === 'pending' ? now() : $record->processed_at,
                            ]));
                            Notification::make()
                                ->title('Pushed to Shiprocket')
                                ->body('AWB: ' . $data['shiprocket_awb'] . ($data['carrier'] ? ' (' . $data['carrier'] . ')' : ''))
                                ->success()
                                ->send();
                        } catch (\Exception $e) {
                            \Log::error('Shiprocket push failed: ' . $e->getMessage());
                            Notification::make()->title('Shiprocket failed')->body($e->getMessage())->danger()->send();
                        }
                    }),
                // Process Order
                Tables\Actions\Action::make('process')
                    ->label('Process Order')
                    ->icon('heroicon-o-check-circle')
                    ->color('info')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => $record->fulfillment_status === 'pending')
                    ->action(function (Order $record) {
                        $record->update([
                            'fulfillment_status' => 'processing',
                            'processed_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Order marked as processing')
                            ->success()
                            ->send();
                    }),
                // Generate Picklist
                Tables\Actions\Action::make('pick')
                    ->label('Mark as Picked')
                    ->icon('heroicon-o-shopping-bag')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => $record->fulfillment_status === 'processing')
                    ->action(function (Order $record) {
                        // Mark all items as picked
                        $record->items()->update([
                            'is_picked' => true,
                            'picked_at' => now(),
                            'picked_quantity' => \DB::raw('quantity'),
                        ]);
                        $record->update([
                            'fulfillment_status' => 'picked',
                            'picked_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Order items marked as picked')
                            ->success()
                            ->send();
                    }),
                // Pack Order
                Tables\Actions\Action::make('pack')
                    ->label('Mark as Packed')
                    ->icon('heroicon-o-archive-box')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => $record->fulfillment_status === 'picked')
                    ->action(function (Order $record) {
                        // Mark all items as packed
                        $record->items()->update([
                            'is_packed' => true,
                            'packed_at' => now(),
                        ]);
                        $record->update([
                            'fulfillment_status' => 'packed',
                            'packed_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Order marked as packed')
                            ->success()
                            ->send();
                    }),
                // Ship Order
                Tables\Actions\Action::make('ship')
                    ->label('Ship Order')
                    ->icon('heroicon-o-truck')
                    ->color('primary')
                    ->form([
                        Forms\Components\TextInput::make('tracking_number')
                            ->label('Tracking Number')
                            ->required()
                            ->maxLength(255)
                            ->default(fn (Order $record) => $record->shiprocket_awb ?? $record->tracking_number),
                        Forms\Components\TextInput::make('carrier')
                            ->label('Carrier')
                            ->maxLength(255)
                            ->placeholder('e.g., FedEx, UPS, India Post')
                            ->default(fn (Order $record) => $record->carrier),
                        Forms\Components\Textarea::make('fulfillment_notes')
                            ->label('Notes')
                            ->rows(3),
                    ])
                    ->visible(fn (Order $record) => $record->fulfillment_status === 'packed')
                    ->action(function (Order $record, array $data) {
                        $record->update([
                            'fulfillment_status' => 'shipped',
                            'status' => 'shipped',
                            'tracking_number' => $data['tracking_number'],
                            'carrier' => $data['carrier'] ?? null,
                            'fulfillment_notes' => $data['fulfillment_notes'] ?? null,
                            'shipped_at' => now(),
                        ]);
                        
                        // Send shipping email
                        try {
                            Mail::to($record->customer->email)->send(new OrderShippedMail($record));
                        } catch (\Exception $e) {
                            \Log::error('Failed to send shipping email: ' . $e->getMessage());
                        }
                        
                        Notification::make()
                            ->title('Order marked as shipped')
                            ->success()
                            ->send();
                    }),
                // Deliver Order
                Tables\Actions\Action::make('deliver')
                    ->label('Mark as Delivered')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => $record->fulfillment_status === 'shipped')
                    ->action(function (Order $record) {
                        $record->update([
                            'fulfillment_status' => 'delivered',
                            'status' => 'delivered',
                            'delivered_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Order marked as delivered')
                            ->success()
                            ->send();
                    }),
                // Generate Shiprocket Pickup
                Tables\Actions\Action::make('shiprocketPickup')
                    ->label('Request Pickup')
                    ->icon('heroicon-o-truck')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->visible(fn (Order $record) => (bool) $record->shiprocket_shipment_id)
                    ->action(function (Order $record) {
                        $service = app(ShiprocketService::class);
                        if (! $service->isConfigured()) {
                            Notification::make()->title('Shiprocket not configured')->danger()->send();
                            return;
                        }
                        try {
                            $service->generatePickup([(int) $record->shiprocket_shipment_id]);
                            Notification::make()->title('Pickup requested with Shiprocket')->success()->send();
                        } catch (\Exception $e) {
                            \Log::error('Shiprocket pickup failed: ' . $e->getMessage());
                            Notification::make()->title('Pickup request failed')->body($e->getMessage())->danger()->send();
                        }
                    }),
                // Cancel on Shiprocket (for returns/cancellations)
                Tables\Actions\Action::make('cancelShiprocket')
                    ->label('Cancel on Shiprocket')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Cancel this order on Shiprocket?')
                    ->visible(fn (Order $record) => (bool) $record->shiprocket_order_id && in_array($record->status, ['cancelled', 'refunded']))
                    ->action(function (Order $record) {
                        $service = app(ShiprocketService::class);
                        if (! $service->isConfigured()) {
                            Notification::make()->title('Shiprocket not configured')->danger()->send();
                            return;
                        }
                        try {
                            $service->cancelOrder($record->shiprocket_order_id);
                            Notification::make()->title('Order cancelled on Shiprocket')->success()->send();
                        } catch (\Exception $e) {
                            \Log::error('Shiprocket cancel failed: ' . $e->getMessage());
                            Notification::make()->title('Cancel failed')->body($e->getMessage())->danger()->send();
                        }
                    }),
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
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'view' => Pages\ViewOrder::route('/{record}'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
