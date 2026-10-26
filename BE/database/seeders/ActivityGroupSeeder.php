<?php

namespace Database\Seeders;

use App\Models\ActivityGroup;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ActivityGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'food' => [
                'name' => 'Ăn uống',
                'description' => 'Nhà hàng, quán ăn, buffet, lẩu nướng, đồ chay, ăn vặt',
                'display_order' => 1,
                'subtypes' => [
                    'Nhà hàng',
                    'Quán ăn',
                    'Buffet',
                    'Đồ nướng / Lẩu',
                    'Đồ chay',
                    'Ăn vặt',
                ],
            ],
            'drink' => [
                'name' => 'Đồ uống',
                'description' => 'Cafe, trà sữa, bar, lounge',
                'display_order' => 2,
                'subtypes' => [
                    'Quán cà phê',
                    'Trà sữa',
                    'Quán bar / Pub',
                    'Lounge',
                ],
            ],
            'checkin' => [
                'name' => 'Check-in / Giải trí',
                'description' => 'Địa điểm sống ảo, phố đi bộ, công viên, landmark, bảo tàng, khu vui chơi',
                'display_order' => 3,
                'subtypes' => [
                    'Địa điểm sống ảo',
                    'Phố đi bộ',
                    'Công viên',
                    'Landmark / Toà nhà nổi tiếng',
                    'Bảo tàng / Triển lãm',
                    'Khu vui chơi',
                ],
            ],
            'movie' => [
                'name' => 'Xem phim',
                'description' => 'Rạp chiếu, phòng chiếu riêng',
                'display_order' => 4,
                'subtypes' => [
                    'Rạp chiếu phim',
                    'Rạp mini / Phòng chiếu riêng',
                ],
            ],
            'date' => [
                'name' => 'Hẹn hò / Hoạt động nhẹ',
                'description' => 'Đi dạo, hồ/cầu/bãi biển, trekking nhẹ, đạp xe',
                'display_order' => 5,
                'subtypes' => [
                    'Đi dạo',
                    'Hồ / Cầu / Bãi biển',
                    'Leo núi nhẹ / Trekking',
                    'Đạp xe',
                ],
            ],
        ];

        foreach ($groups as $key => $groupData) {
            $group = ActivityGroup::updateOrCreate(
                ['key' => $key],
                Arr::only($groupData, ['name', 'description', 'display_order']) + ['is_active' => true]
            );

            $pivotData = [];

            foreach ($groupData['subtypes'] as $index => $subtypeName) {
                $category = Category::firstOrCreate(
                    ['name' => Str::slug($subtypeName)],
                    [
                        'display_name' => $subtypeName,
                        'description' => $subtypeName,
                        'is_active' => true,
                    ]
                );

                $pivotData[$category->id] = [
                    'subtype_name' => $subtypeName,
                    'display_order' => $index + 1,
                ];
            }

            $group->categories()->sync($pivotData);
        }
    }
}


