<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates or updates the admin user
     */
    public function run()
    {
        $email = env('ADMIN_EMAIL', 'admin@vinuvisthara.com');
        $password = env('ADMIN_PASSWORD', 'admin123');
        $name = env('ADMIN_NAME', 'Admin');

        $user = User::where('email', $email)->first();

        if ($user) {
            // User exists - check if password needs to be reset
            if (!Hash::check($password, $user->password)) {
                $user->password = Hash::make($password);
                $user->save();
                $this->command->info("Admin user password reset for: {$email}");
            } else {
                $this->command->info("Admin user already exists: {$email}");
            }
        } else {
            // Create new admin user
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);
            $this->command->info("Admin user created: {$email}");
        }

        $this->command->info("Admin credentials:");
        $this->command->info("  Email: {$email}");
        $this->command->info("  Password: {$password}");
    }
}
