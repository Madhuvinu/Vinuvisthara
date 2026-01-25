<?php

namespace App\Filament\Resources\CollectionsSettingResource\Pages;

use App\Filament\Resources\CollectionsSettingResource;
use Filament\Actions;
use Filament\Resources\Pages\Page;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;

class ManageCollectionsSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = CollectionsSettingResource::class;

    protected static string $view = 'filament.resources.collections-setting-resource.pages.manage-collections-settings';

    public ?array $data = [];

    public function mount(): void
    {
        // Load or create the singleton settings record
        $settings = \App\Models\CollectionsSetting::getSettings();
        $this->form->fill($settings->toArray());
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('save')
                ->label('Save Settings')
                ->submit('save')
                ->color('primary'),
        ];
    }

    public function form(Form $form): Form
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
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $settings = \App\Models\CollectionsSetting::getSettings();
        $settings->update($data);
        
        Notification::make()
            ->title('Settings saved successfully!')
            ->success()
            ->send();
    }
}
