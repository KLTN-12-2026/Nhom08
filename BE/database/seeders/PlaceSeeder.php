<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class PlaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users and categories
        $users = User::all();
        $categories = Category::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        if ($categories->isEmpty()) {
            $this->command->warn('No categories found. Please run CategorySeeder first.');
            return;
        }

        $places = [
            [
                'name' => 'Hội An Old Town',
                'address' => 'Hoi An Ancient Town, Hoi An, Quang Nam',
                'latitude' => 15.8801,
                'longitude' => 108.3380,
                'description' => 'Ancient town with historic architecture, lantern-lit streets',
                'category_name' => 'dia-diem-song-ao',
                'average_price' => 150000,
                'rating' => 4.5,
                'status' => 1,
                'contact_phone' => '0901234567',
            ],
            [
                'name' => 'Bún Bò Huế - Cô Ba',
                'address' => '123 Nguyen Du, Ho Chi Minh City',
                'latitude' => 10.7626,
                'longitude' => 106.6602,
                'description' => 'Famous for traditional Hue beef noodle soup',
                'category_name' => 'quan-an',
                'average_price' => 60000,
                'rating' => 4.8,
                'status' => 1,
                'contact_phone' => '0912345678',
            ],
            [
                'name' => 'Phở Gà Luyên',
                'address' => '456 Le Van Viet, Thu Duc, Ho Chi Minh City',
                'latitude' => 10.8563,
                'longitude' => 106.7644,
                'description' => 'Delicious chicken pho with rich broth',
                'category_name' => 'quan-an',
                'average_price' => 55000,
                'rating' => 4.6,
                'status' => 1,
                'contact_phone' => '0923456789',
            ],
            [
                'name' => 'Cố Đô Hue Imperial City',
                'address' => 'Imperial City, Hue, Thua Thien Hue',
                'latitude' => 16.4676,
                'longitude' => 107.5745,
                'description' => 'Historic imperial city complex with palaces and temples',
                'category_name' => 'bao-tang-trien-lam',
                'average_price' => 200000,
                'rating' => 4.7,
                'status' => 1,
                'contact_phone' => '0934567890',
            ],
            [
                'name' => 'Vincom Center Saigon',
                'address' => '72 Le Thanh Ton, District 1, Ho Chi Minh City',
                'latitude' => 10.7757,
                'longitude' => 106.7018,
                'description' => 'Modern shopping mall with international brands',
                'category_name' => 'khu-vui-choi',
                'average_price' => 500000,
                'rating' => 4.4,
                'status' => 1,
                'contact_phone' => '0945678901',
            ],
            [
                'name' => 'Landmark 81',
                'address' => '720A Dien Bien Phu, Binh Thanh District, Ho Chi Minh City',
                'latitude' => 10.7948,
                'longitude' => 106.7221,
                'description' => 'Tallest building in Vietnam with panoramic city views',
                'category_name' => 'landmark-toa-nha-noi-tieng',
                'average_price' => 300000,
                'rating' => 4.6,
                'status' => 1,
                'contact_phone' => '0956789012',
            ],
            [
                'name' => 'Bảo Tàng Chứng Tích Chiến Tranh',
                'address' => '28 Vo Van Tan, District 3, Ho Chi Minh City',
                'latitude' => 10.7793,
                'longitude' => 106.6931,
                'description' => 'War Remnants Museum showcasing historical artifacts',
                'category_name' => 'bao-tang-trien-lam',
                'average_price' => 40000,
                'rating' => 4.5,
                'status' => 1,
                'contact_phone' => '0967890123',
            ],
            [
                'name' => 'Cà Phê Trung Nguyên Legend',
                'address' => '120 Xuan Thuy, Cau Giay, Ha Noi',
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'description' => 'Iconic Vietnamese coffee chain with traditional ambiance',
                'category_name' => 'quan-ca-phe',
                'average_price' => 50000,
                'rating' => 4.3,
                'status' => 1,
                'contact_phone' => '0978901234',
            ],
            [
                'name' => 'Bà Chiểu Market',
                'address' => 'Dien Hong Square, Binh Thanh District, Ho Chi Minh City',
                'latitude' => 10.8029,
                'longitude' => 106.7059,
                'description' => 'Traditional local market with fresh produce and street food',
                'category_name' => 'an-vat',
                'average_price' => 80000,
                'rating' => 4.2,
                'status' => 1,
                'contact_phone' => '0989012345',
            ],
            [
                'name' => 'Golden Dragon Water Puppet Theatre',
                'address' => '55B Nguyen Thi Minh Khai, District 1, Ho Chi Minh City',
                'latitude' => 10.7852,
                'longitude' => 106.6984,
                'description' => 'Traditional water puppet shows showcasing Vietnamese culture',
                'category_name' => 'khu-vui-choi',
                'average_price' => 200000,
                'rating' => 4.4,
                'status' => 1,
                'contact_phone' => '0990123456',
            ],
            [
                'name' => 'Apocalypse Now Pub',
                'address' => '2C Thi Sach, District 1, Ho Chi Minh City',
                'latitude' => 10.7924,
                'longitude' => 106.6946,
                'description' => 'Popular nightlife spot with live music and drinks',
                'category_name' => 'quan-bar-pub',
                'average_price' => 300000,
                'rating' => 4.3,
                'status' => 1,
                'contact_phone' => '0901237890',
            ],
            [
                'name' => 'Hoàng Phúc Bakery',
                'address' => '789 Nguyen Trai, Thanh Xuan, Ha Noi',
                'latitude' => 21.0010,
                'longitude' => 105.8065,
                'description' => 'Famous bakery with fresh bread and pastries',
                'category_name' => 'an-vat',
                'average_price' => 40000,
                'rating' => 4.7,
                'status' => 1,
                'contact_phone' => '0912348901',
            ],
            [
                'name' => 'Chùa Linh Ứng',
                'address' => 'Hai Van Mountain, Da Nang',
                'latitude' => 16.0983,
                'longitude' => 108.3100,
                'description' => 'Beautiful Buddhist temple with giant Guan Yin statue',
                'category_name' => 'dia-diem-song-ao',
                'average_price' => 0,
                'rating' => 4.8,
                'status' => 1,
                'contact_phone' => '0923457012',
            ],
            [
                'name' => 'My Khe Beach',
                'address' => 'My Khe Beach, Da Nang',
                'latitude' => 16.0592,
                'longitude' => 108.2350,
                'description' => 'Beautiful sandy beach with crystal clear water',
                'category_name' => 'ho-cau-bai-bien',
                'average_price' => 0,
                'rating' => 4.5,
                'status' => 1,
                'contact_phone' => '0934568123',
            ],
            [
                'name' => 'The Pizza Company',
                'address' => '123 Nguyen Hue, District 1, Ho Chi Minh City',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'description' => 'International pizza chain with various toppings',
                'category_name' => 'nha-hang',
                'average_price' => 250000,
                'rating' => 4.1,
                'status' => 1,
                'contact_phone' => '0945679234',
            ],
            [
                'name' => 'Big C Supermarket',
                'address' => '500 Nguyen Kim, Tan Binh District, Ho Chi Minh City',
                'latitude' => 10.7899,
                'longitude' => 106.6534,
                'description' => 'Large supermarket chain with wide variety of products',
                'category_name' => 'shopping',
                'average_price' => 300000,
                'rating' => 4.0,
                'status' => 1,
                'contact_phone' => '0956780345',
            ],
            [
                'name' => 'Bún Riêu Cô Ba',
                'address' => '89 Pasteur, District 3, Ho Chi Minh City',
                'latitude' => 10.7892,
                'longitude' => 106.6911,
                'description' => 'Famous crab noodle soup with rich broth',
                'category_name' => 'quan-an',
                'average_price' => 70000,
                'rating' => 4.6,
                'status' => 1,
                'contact_phone' => '0967891456',
            ],
            [
                'name' => 'Sky36 Rooftop Bar',
                'address' => '36 Ben Me Thu, District 1, Ho Chi Minh City',
                'latitude' => 10.7736,
                'longitude' => 106.7012,
                'description' => 'High-end rooftop bar with stunning city views',
                'category_name' => 'quan-bar-pub',
                'average_price' => 500000,
                'rating' => 4.5,
                'status' => 1,
                'contact_phone' => '0978902567',
            ],
            [
                'name' => 'CGV Cresent Mall',
                'address' => '101 Ton Dat Tien, District 7, Ho Chi Minh City',
                'latitude' => 10.7434,
                'longitude' => 106.7211,
                'description' => 'Modern cinema multiplex showing the latest blockbusters',
                'category_name' => 'rap-chieu-phim',
                'average_price' => 120000,
                'rating' => 4.4,
                'status' => 1,
                'contact_phone' => '02854171333',
            ],
            [
                'name' => 'Đường Sách Nguyễn Văn Bình',
                'address' => 'Nguyen Van Binh, District 1, Ho Chi Minh City',
                'latitude' => 10.7776,
                'longitude' => 106.6975,
                'description' => 'Book street with cafes and bookstores',
                'category_name' => 'pho-di-bo',
                'average_price' => 100000,
                'rating' => 4.4,
                'status' => 1,
                'contact_phone' => '0989013678',
            ],
            [
                'name' => 'Bảo Tàng Lịch Sử Việt Nam',
                'address' => '2 Nguyen Binh Khiem, District 1, Ho Chi Minh City',
                'latitude' => 10.7889,
                'longitude' => 106.6981,
                'description' => 'History museum showcasing Vietnamese artifacts',
                'category_name' => 'bao-tang-trien-lam',
                'average_price' => 30000,
                'rating' => 4.3,
                'status' => 1,
                'contact_phone' => '0990124789',
            ],
        ];

        foreach ($places as $placeData) {
            $categoryName = $placeData['category_name'];
            unset($placeData['category_name']);

            $category = Category::where('name', $categoryName)->first();
            $categoryId = $category ? $category->id : $categories->random()->id;

            $place = Place::updateOrCreate(
                [
                    'name' => $placeData['name'],
                    'address' => $placeData['address'],
                ],
                [
                    'user_id' => $users->random()->id,
                    'latitude' => $placeData['latitude'],
                    'longitude' => $placeData['longitude'],
                    'description' => $placeData['description'],
                    'average_price' => $placeData['average_price'],
                    'rating' => $placeData['rating'],
                    'status' => $placeData['status'],
                    'contact_phone' => $placeData['contact_phone'] ?? null,
                    'is_anonymous' => false,
                ]
            );

            $place->categories()->sync([$categoryId]);

            // Sync corresponding activity groups automatically
            $activityGroupIds = DB::table('activity_group_category')
                ->where('category_id', $categoryId)
                ->pluck('activity_group_id')
                ->toArray();
            
            if (!empty($activityGroupIds)) {
                $place->activityGroups()->sync($activityGroupIds);
            }
        }

        $this->command->info('Places seeded successfully with activity groups!');
    }
}
