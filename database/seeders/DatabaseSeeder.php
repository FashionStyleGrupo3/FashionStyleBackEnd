<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        $this->call([
<<<<<<< HEAD
            InventarioSeeder::class,
        ]);


        $this->call([
=======
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
            RoleSeeder::class,
        ]);

       
        $admin = User::factory()->create([
            'nombre' => 'Test User',
            'email' => 'test@example.com',
        ]);

        
        $admin->assignRole('admin');
    }
}
