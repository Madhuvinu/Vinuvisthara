<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates admin user with email: admin@vinuvisthara.com and password: admin123
     */
    public function run(): void
    {
        $adminEmail = 'admin@vinuvisthara.com';
        $adminPassword = 'admin123';
        $adminName = 'Admin';
        
        // Check if admin user already exists
        $admin = User::where('email', $adminEmail)->first();
        
        if ($admin) {
            // Update password if it doesn't match (in case it was changed)
            if (!Hash::check($adminPassword, $admin->password)) {
                $admin->password = Hash::make($adminPassword);
                $admin->save();
                $this->command->info("Admin user password reset to: {$adminPassword}");
            }
            $this->command->info("Admin user already exists with email: {$adminEmail}");
            $this->command->info("Password: {$adminPassword}");
            return;
        }
        
        // Create new admin user
        try {
            $admin = User::create([
                'name' => $adminName,
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'phone' => null,
            ]);
            
            $this->command->info('✅ Admin user created successfully!');
            $this->command->info("   Email: {$adminEmail}");
            $this->command->info("   Password: {$adminPassword}");
            $this->command->info("   Name: {$adminName}");
            $this->command->warn('⚠️  Please change the password after first login for security!');
        } catch (\Exception $e) {
            $this->command->error('❌ Failed to create admin user: ' . $e->getMessage());
            throw $e;
        }
    }
}
