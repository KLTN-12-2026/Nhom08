<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class TrendingPlaceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $places = [
            // ===================== ĐÀ NẴNG =====================
            ['name'=>'Bún Chả Cá Bà Thừa','address'=>'278 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng','latitude'=>16.0524,'longitude'=>108.2163,'description'=>'Quán bún chả cá nổi tiếng số 1 Đà Nẵng, được hàng loạt TikToker review, nước dùng ngọt thanh đặc trưng miền Trung.','category_name'=>'quan-an','average_price'=>45000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0905123456'],
            ['name'=>'Mì Quảng Bà Vị','address'=>'166 Thái Phiên, Hải Châu, Đà Nẵng','latitude'=>16.0578,'longitude'=>108.2198,'description'=>'Mì Quảng chuẩn vị Đà Nẵng, TikToker ẩm thực check-in nườm nượp mỗi buổi sáng.','category_name'=>'quan-an','average_price'=>40000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0905234567'],
            ['name'=>'Bánh Mì Bà Lan','address'=>'48 Trần Bình Trọng, Hải Châu, Đà Nẵng','latitude'=>16.0611,'longitude'=>108.2121,'description'=>'Ổ bánh mì xịn nhất Đà Nẵng theo TikTok, nhân phong phú, vỏ giòn rụm, xếp hàng từ 6 giờ sáng.','category_name'=>'an-vat','average_price'=>25000,'rating'=>4.9,'status'=>1,'contact_phone'=>'0905345678'],
            ['name'=>'Nem Lụi Bà Bảy','address'=>'20 Trần Quốc Toản, Hải Châu, Đà Nẵng','latitude'=>16.0643,'longitude'=>108.2234,'description'=>'Nem lụi nướng than hoa, đặc sản Đà Nẵng được TikToker ẩm thực cả nước ghé thăm.','category_name'=>'an-vat','average_price'=>60000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0905456789'],
            ['name'=>'Cơm Gà Bà Buội','address'=>'22 Nguyễn Thị Minh Khai, Đà Nẵng','latitude'=>16.0681,'longitude'=>108.2155,'description'=>'Cơm gà Hội An style ngay tại Đà Nẵng, viral TikTok với gà vàng ươm mềm thơm, cơm hạt rời béo ngậy.','category_name'=>'quan-an','average_price'=>55000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0905567890'],
            ['name'=>'Chè Bắp Bà Sáu','address'=>'78 Ông Ích Khiêm, Đà Nẵng','latitude'=>16.0552,'longitude'=>108.2243,'description'=>'Chè bắp Đà Nẵng chuẩn vị, review triệu view trên TikTok, hạt bắp nếp dẻo ngọt, nước cốt dừa béo.','category_name'=>'an-vat','average_price'=>20000,'rating'=>4.6,'status'=>1,'contact_phone'=>'0905678901'],
            ['name'=>'Café Morico Da Nang','address'=>'112 Bạch Đằng, Hải Châu, Đà Nẵng','latitude'=>16.0733,'longitude'=>108.2247,'description'=>'Quán cà phê view sông Hàn cực đẹp, hot trend checkin TikTok 2024.','category_name'=>'quan-ca-phe','average_price'=>65000,'rating'=>4.6,'status'=>1,'contact_phone'=>'0905789012'],
            ['name'=>'Trà Sữa Tiger Sugar Đà Nẵng','address'=>'215 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng','latitude'=>16.0618,'longitude'=>108.1978,'description'=>'Chuỗi trà sữa Tiger Sugar đình đám Đài Loan, sọc caramel đặc trưng viral TikTok toàn cầu.','category_name'=>'tra-sua','average_price'=>55000,'rating'=>4.5,'status'=>1,'contact_phone'=>'0905890123'],
            ['name'=>'Lẩu Bò Tơ Đà Nẵng','address'=>'88 Nguyễn Tri Phương, Đà Nẵng','latitude'=>16.0701,'longitude'=>108.2289,'description'=>'Lẩu bò tơ nổi tiếng nhất Đà Nẵng, thịt bò tươi mềm ngọt, viral TikTok với nước dùng đỏ au bắt mắt.','category_name'=>'do-nuong-lau','average_price'=>200000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0905901234'],
            ['name'=>'Bún Bò Gánh Bà Hạnh','address'=>'45 Lê Lợi, Hải Châu, Đà Nẵng','latitude'=>16.0665,'longitude'=>108.2239,'description'=>'Bún bò Huế gánh hàng rong huyền thoại Đà Nẵng, TikToker review là phải ăn khi ghé thăm miền Trung.','category_name'=>'quan-an','average_price'=>50000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0906012345'],
            // ===================== HÀ NỘI =====================
            ['name'=>'Bún Đậu Mắm Tôm Cô Lan','address'=>'1 Hàng Khay, Hoàn Kiếm, Hà Nội','latitude'=>21.0282,'longitude'=>105.8521,'description'=>'Bún đậu mắm tôm chuẩn Hà Nội, viral TikTok triệu view, chả cốm vàng giòn, đậu rán nóng hổi.','category_name'=>'quan-an','average_price'=>70000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0907123456'],
            ['name'=>'Xôi Yến Nguyễn Hữu Huân','address'=>'35B Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội','latitude'=>21.0341,'longitude'=>105.8524,'description'=>'Xôi Yến nổi tiếng nhất Hà Nội, TikTok ẩm thực nước ngoài cũng review, hàng dài mỗi buổi sáng.','category_name'=>'an-vat','average_price'=>35000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0907234567'],
            ['name'=>'Bún Chả Hương Liên (Obama)','address'=>'24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội','latitude'=>21.0213,'longitude'=>105.8484,'description'=>'Quán bún chả nơi Barack Obama từng ăn tối với Anthony Bourdain, viral toàn cầu.','category_name'=>'quan-an','average_price'=>80000,'rating'=>4.9,'status'=>1,'contact_phone'=>'0907345678'],
            ['name'=>'Phở Thìn Lò Đúc','address'=>'13 Lò Đúc, Hai Bà Trưng, Hà Nội','latitude'=>21.0178,'longitude'=>105.8503,'description'=>'Phở bò xào tỏi độc đáo nhất Hà Nội, hàng loạt TikToker ẩm thực quốc tế tìm đến ăn, nổi tiếng 50 năm.','category_name'=>'quan-an','average_price'=>75000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0907456789'],
            ['name'=>'Egg Coffee Café Giang','address'=>'39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội','latitude'=>21.0349,'longitude'=>105.8526,'description'=>'Quán cà phê trứng nổi tiếng nhất Việt Nam, điểm đến bắt buộc của mọi TikToker du lịch Hà Nội.','category_name'=>'quan-ca-phe','average_price'=>45000,'rating'=>4.9,'status'=>1,'contact_phone'=>'0907678901'],
            ['name'=>'Bánh Cuốn Bà Hoành','address'=>'66 Tô Hiến Thành, Hai Bà Trưng, Hà Nội','latitude'=>21.0146,'longitude'=>105.8488,'description'=>'Bánh cuốn nóng Thanh Trì số 1 Hà Nội, TikToker review liên tục với lớp bánh mỏng, nhân thịt mộc nhĩ.','category_name'=>'quan-an','average_price'=>50000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0907789012'],
            ['name'=>'Lẩu Nấm Nhà Sàn','address'=>'130 Đội Cấn, Ba Đình, Hà Nội','latitude'=>21.0392,'longitude'=>105.8358,'description'=>'Lẩu nấm rừng trong không gian nhà sàn Tây Bắc độc đáo, hot trend checkin TikTok 2024.','category_name'=>'do-nuong-lau','average_price'=>350000,'rating'=>4.6,'status'=>1,'contact_phone'=>'0907890123'],
            // ===================== TP. HỒ CHÍ MINH =====================
            ['name'=>'Cơm Tấm Thuận Kiều','address'=>'195C Thuận Kiều, Quận 5, TP.HCM','latitude'=>10.7523,'longitude'=>106.6665,'description'=>'Cơm tấm sườn bì chả nổi tiếng nhất Sài Gòn, viral TikTok với đĩa cơm đầy ắp, mỡ hành béo ngậy.','category_name'=>'quan-an','average_price'=>65000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0908123456'],
            ['name'=>'Hủ Tiếu Nam Vang Mỹ Tho','address'=>'110 Võ Văn Tần, Quận 3, TP.HCM','latitude'=>10.7762,'longitude'=>106.6907,'description'=>'Hủ tiếu Nam Vang dry style siêu hot TikTok, nước lèo ngọt thanh, topping thịt bằm cực phong phú.','category_name'=>'quan-an','average_price'=>60000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0908234567'],
            ['name'=>'Bánh Xèo Mười Xiềm','address'=>'204 Đinh Công Tráng, Quận 1, TP.HCM','latitude'=>10.7829,'longitude'=>106.6862,'description'=>'Bánh xèo giòn cực ngon, TikToker ẩm thực Sài Gòn review nhiều nhất 2024, nhân tôm thịt giáp mặt.','category_name'=>'quan-an','average_price'=>90000,'rating'=>4.8,'status'=>1,'contact_phone'=>'0908345678'],
            ['name'=>'Gà Nướng Lu Bình Dương','address'=>'452 Phan Văn Trị, Gò Vấp, TP.HCM','latitude'=>10.8198,'longitude'=>106.7015,'description'=>'Gà nướng lu đất sét viral TikTok triệu view, da giòn thơm, thịt mọng nước đặc trưng khó cưỡng.','category_name'=>'nha-hang','average_price'=>250000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0908456789'],
            ['name'=>'Bánh Mì Huỳnh Hoa','address'=>'26 Lê Thị Riêng, Quận 1, TP.HCM','latitude'=>10.7975,'longitude'=>106.6968,'description'=>'Bánh mì xịn nhất Sài Gòn, TikToker quốc tế nào ghé TP.HCM cũng phải review, hàng dài cả buổi tối.','category_name'=>'an-vat','average_price'=>40000,'rating'=>4.9,'status'=>1,'contact_phone'=>'0908567890'],
            ['name'=>'Lẩu Cua Đồng Út Tịch','address'=>'50 Út Tịch, Tân Bình, TP.HCM','latitude'=>10.8021,'longitude'=>106.6562,'description'=>'Lẩu cua đồng miền Tây chuẩn vị, viral TikTok với bông điên điển vàng ươm, cua đồng gạch son.','category_name'=>'do-nuong-lau','average_price'=>180000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0908678901'],
            ['name'=>'Chè Khúc Bạch Bà Hà','address'=>'82 Trần Hưng Đạo, Quận 1, TP.HCM','latitude'=>10.7714,'longitude'=>106.6937,'description'=>'Chè khúc bạch sữa tươi hot nhất Sài Gòn, TikTok triệu view với lớp thạch trắng mịn trong như pha lê.','category_name'=>'an-vat','average_price'=>45000,'rating'=>4.6,'status'=>1,'contact_phone'=>'0908789012'],
            ['name'=>'The Coffee House Signature Đồng Khởi','address'=>'86 Đồng Khởi, Quận 1, TP.HCM','latitude'=>10.7777,'longitude'=>106.7028,'description'=>'Flagship store The Coffee House với concept cao cấp, hot trend check-in TikTok view đường Đồng Khởi.','category_name'=>'quan-ca-phe','average_price'=>80000,'rating'=>4.5,'status'=>1,'contact_phone'=>'0908890123'],
            ['name'=>'Trà Sữa Phúc Long Hội Sở','address'=>'84A Nguyễn Du, Quận 1, TP.HCM','latitude'=>10.7785,'longitude'=>106.6921,'description'=>'Trà sữa Phúc Long huyền thoại Sài Gòn, TikToker review combo trà sữa bánh mì giòn không thể thiếu.','category_name'=>'tra-sua','average_price'=>55000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0908901234'],
            ['name'=>'Bò Né 3T Sài Gòn','address'=>'200 Pasteur, Quận 3, TP.HCM','latitude'=>10.7842,'longitude'=>106.6927,'description'=>'Bò né Sài Gòn xèo xèo trên chảo gang viral TikTok, trứng ốp la, bò bít tết mềm ăn kèm bánh mì nóng.','category_name'=>'nha-hang','average_price'=>95000,'rating'=>4.7,'status'=>1,'contact_phone'=>'0909012345'],
        ];

        $count = 0;
        foreach ($places as $placeData) {
            $categoryName = $placeData['category_name'];
            unset($placeData['category_name']);

            $category = Category::where('name', $categoryName)->first();
            if (!$category) {
                $this->command->warn("Category '{$categoryName}' not found, skipping.");
                continue;
            }

            $place = Place::updateOrCreate(
                ['name' => $placeData['name'], 'address' => $placeData['address']],
                [
                    'user_id'       => $users->random()->id,
                    'latitude'      => $placeData['latitude'],
                    'longitude'     => $placeData['longitude'],
                    'description'   => $placeData['description'],
                    'average_price' => $placeData['average_price'],
                    'rating'        => $placeData['rating'],
                    'status'        => $placeData['status'],
                    'contact_phone' => $placeData['contact_phone'] ?? null,
                    'is_anonymous'  => false,
                ]
            );

            $place->categories()->sync([$category->id]);

            $activityGroupIds = DB::table('activity_group_category')
                ->where('category_id', $category->id)
                ->pluck('activity_group_id')
                ->toArray();

            if (!empty($activityGroupIds)) {
                $place->activityGroups()->sync($activityGroupIds);
            }

            $count++;
        }

        $this->command->info("Seeded {$count} trending TikTok places successfully!");
    }
}
