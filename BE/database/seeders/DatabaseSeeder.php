<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::firstOrNew([
            'email' => 'admin@Trove.vn',
        ]);
        
        if (!$user->exists) {
            $user->fill([
                'username' => 'admin@Trove.vn',
                'name' => 'Admin System',
                'hashed_password' => Hash::make('123456789'),
                'password' => Hash::make('123456789'),
                'role' => 'admin',
                'gender' => 'other',
                'is_active' => true,
                'is_blocked' => false,
            ]);
            $user->save();
            
            // Create wallet for admin
            Wallet::create([
                'user_id' => $user->id,
                'points' => 1000000, // Admin có nhiều points
                'level' => 100,
                'total_earned' => 1000000,
                'total_spent' => 0,
            ]);
        }

        $this->call([
            CategorySeeder::class,
            ActivityGroupSeeder::class,
            PlaceSeeder::class,
            PlaceMediaSeeder::class,
            TrendingPlaceSeeder::class,
        ]);
    }
}
