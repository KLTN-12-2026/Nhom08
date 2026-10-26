<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'food',
                'display_name' => 'Đồ ăn',
                'description' => 'Các địa điểm ăn uống',
                'is_active' => true,
            ],
            [
                'name' => 'entertainment',
                'display_name' => 'Giải trí',
                'description' => 'Các địa điểm giải trí',
                'is_active' => true,
            ],
            [
                'name' => 'shopping',
                'display_name' => 'Mua sắm',
                'description' => 'Các địa điểm mua sắm',
                'is_active' => true,
            ],
            [
                'name' => 'tourism',
                'display_name' => 'Du lịch',
                'description' => 'Các địa điểm du lịch',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['name' => $category['name']], $category);
        }

        $this->command->info('Categories seeded successfully!');
    }
}
