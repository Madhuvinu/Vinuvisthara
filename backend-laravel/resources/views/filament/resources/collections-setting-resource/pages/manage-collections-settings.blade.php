<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}

        <div class="flex justify-end gap-4 mt-6">
            <x-filament::button type="submit" color="primary">
                Save Settings
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>
