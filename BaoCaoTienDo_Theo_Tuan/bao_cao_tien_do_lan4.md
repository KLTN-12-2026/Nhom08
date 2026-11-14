# BÁO CÁO TIẾN ĐỘ LẦN 4

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 14/11/2026

---

## 1. Tổng quan công việc đã hoàn thành trong đợt 4 (Sprint 2 - Phân hệ Khách hàng / Customer Web)

Tiếp nối thành công của Sprint 1 (hoàn tất 100% phân hệ Quản trị Admin), trong tuần qua nhóm đã tập trung triển khai toàn diện **Sprint 2: Xây dựng Phân hệ Khách hàng trên nền tảng Web (Customer Web Portal)**. Nhóm đã hoàn thiện từ cấu trúc Master Layout, hệ thống Xác thực tài khoản khách hàng, đến các tính năng cốt lõi về Khám phá - Đăng tải - Bình luận địa điểm và Trải nghiệm Lên kế hoạch thông minh (Smart Planning).

---

### 1.1. Hoàn thiện Bộ khung Giao diện Khách hàng & Xác thực (Layout & Authentication)

1. **Khung giao diện Masterpage Khách hàng (`CustomerLayout`):**
   - Xây dựng bố cục Header, Navigation bar và Footer riêng biệt, hiện đại theo nhận diện thương hiệu Trove.
   - Hỗ trợ đầy đủ chuyển đổi đa ngôn ngữ (Tiếng Việt / English) và Dark Mode / Light Mode.
   - Cơ chế bảo vệ phân quyền: Tự động phát hiện và ngăn chặn Admin truy cập nhầm phiên làm việc của Customer, tự động điều hướng linh hoạt theo trạng thái phiên đăng nhập.

2. **Hệ thống Đăng nhập / Đăng ký / Quên mật khẩu (`CustomerAuth`):**
   - **Đăng nhập (`/login`):** Xác thực khách hàng qua Email/Password, lưu trữ token Sanctum (`customer_access_token`) và đồng bộ trạng thái tài khoản vào Zustand store.
   - **Đăng ký (`/register`):** Form đăng ký tài khoản khách hàng mới với validation chặt chẽ (định dạng email, độ dài mật khẩu, xác nhận mật khẩu).
   - **Quên mật khẩu & Đặt lại mật khẩu (`/forgot-password`):** Quy trình gửi mã xác thực / link đặt lại mật khẩu qua email an toàn.

---

### 1.2. Hoàn thiện Trang chủ Khách hàng & Khám phá địa điểm (Customer Homepage & Places)

1. **Trang chủ Khách hàng (`Home` - `/`):**
   - Banner chào đón trực quan, hiển thị slogan truyền cảm hứng hẹn hò, gặp gỡ.
   - Thanh tìm kiếm nhanh cùng các danh mục nổi bật (Đồ ăn, Đồ uống, Hẹn hò, Giải trí).
   - Danh sách địa điểm xu hướng (Trending / Popular places) và các kế hoạch mẫu gợi ý.

2. **Chức năng Tìm kiếm & Lọc địa điểm đa tiêu chí (`PublicPlaces` - `/location`):**
   - **Tìm kiếm thông minh (Debounce Search 350ms):** Tối ưu hóa việc tìm kiếm theo tên địa điểm, địa chỉ, mô tả; hạn chế gửi request thừa lên máy chủ.
   - **Bộ lọc nâng cao đồng bộ FE & BE:**
     - Lọc theo Nhóm hoạt động / Danh mục (`activity_group_ids`, `category_ids`).
     - Lọc theo Khoảng giá trung bình (`price_min`, `price_max`: dưới 200k, 200k-500k, trên 500k).
     - Lọc theo Bán kính khoảng cách (`distance_km`) dựa trên tọa độ GPS và công thức tính khoảng cách Haversine.
   - **Trải nghiệm tương tác người dùng:**
     - Huy hiệu (Filter Badges) hiển thị rõ các điều kiện lọc đang chọn kèm nút xóa nhanh từng tiêu chí hoặc xóa tất cả.
     - Phân trang mượt mà không bị mất điều kiện lọc khi chuyển trang.
     - Giao diện Empty State thân thiện khi không tìm thấy kết quả.

3. **Chức năng Xem chi tiết địa điểm (`CustomerPlaces` - `/places/:id`):**
   - Hiển thị đầy đủ hình ảnh, thông tin liên hệ (hotline, email, giờ mở/đóng cửa, mức giá trung bình, địa chỉ).
   - Tích hợp bản đồ vị trí, danh sách thẻ tiện ích (Tags) và danh mục liên quan.
   - Chức năng **Lưu địa điểm yêu thích (`Favorite Places`)**: Bật/tắt lưu địa điểm vào danh sách yêu thích của cá nhân qua API `POST /api/favorite-places/toggle`.

4. **Chức năng Đăng địa điểm mới từ phía Khách hàng (`/places/create`):**
   - Cho phép người dùng cộng đồng đóng góp địa điểm mới.
   - Hỗ trợ tải lên hình ảnh, chọn danh mục, nhóm hoạt động, mức giá dự kiến, tọa độ và thời gian hoạt động.
   - Địa điểm sau khi đăng sẽ tự động tuân thủ cấu hình duyệt tự động hoặc chờ Admin kiểm duyệt theo thiết lập hệ thống.

---

### 1.3. Hoàn thiện Tính năng Đánh giá & Bình luận địa điểm (Reviews & Ratings)

1. **Phía Frontend:**
   - Khung nhập bình luận kèm đánh giá số sao (Rating 1 - 5 sao).
   - Danh sách bình luận theo thời gian thực: Hiển thị avatar, tên người dùng, thời gian đăng, nội dung nhận xét và số sao.
   - Chức năng chỉnh sửa / xóa bình luận của chính người dùng.
2. **Phía Backend:**
   - Xây dựng đầy đủ RESTful API cho Review:
     - `GET /api/reviews/place/{placeId}` (công khai cho tất cả người dùng).
     - `POST /api/reviews` (tạo đánh giá mới - yêu cầu đăng nhập).
     - `PUT /api/reviews/{id}` và `DELETE /api/reviews/{id}`.
   - Thiết lập `ReviewPolicy` kiểm soát quyền: Chỉ chủ sở hữu bình luận mới có quyền sửa/xóa bình luận của mình.
   - Tự động cập nhật điểm rating trung bình của địa điểm khi có đánh giá mới.

---

### 1.4. Tính năng Vòng quay địa điểm ngẫu nhiên (Customer Spin Wheel - `/date/spin`)

- **Mục đích:** Giải quyết vấn đề nan giải "Hôm nay đi đâu/ăn gì?" cho các cặp đôi hoặc nhóm bạn.
- **Tính năng nổi bật:**
  - Vòng quay may mắn canvas mượt mà, hiệu ứng xoay giảm tốc chân thực (`easeOut`), kim chỉ vị trí, icon emoji và tên quán.
  - Tự động nạp danh sách từ các địa điểm yêu thích của người dùng hoặc bộ địa điểm thịnh hành.
  - Cho phép tùy chọn các địa điểm tham gia vòng quay (chọn từng điểm, chọn tất cả, xóa hết).
  - Modal công bố kết quả ngẫu nhiên kèm thông tin chi tiết địa điểm trúng thưởng.
  - Lưu và quản lý lịch sử các lần quay trước đó.

---

### 1.5. Tính năng Lên kế hoạch gặp gỡ & Điều phối nhóm (Customer Planning & Smart AI Planner)

Đã sao chép và tích hợp hoàn chỉnh hệ thống lập kế hoạch (`/plans`, `/plans/create`):

1. **Quản lý danh sách kế hoạch (`CustomerPlans`):**
   - Theo dõi toàn bộ lịch trình đã tạo, trạng thái, thời gian dự kiến và ngân sách.
   - Modal xem chi tiết lộ trình kèm danh sách điểm đến theo thứ tự thời gian.
2. **Trợ lý thông minh Lên lịch trình (Smart AI Planner):**
   - Thiết lập phong cách buổi gặp (Hẹn hò lãng mạn, Họp mặt bạn bè, Gia đình, Công việc...).
   - Lựa chọn ngân sách, khung giờ, khu vực mong muốn.
   - Tự động tạo timeline lộ trình với khoảng giá ước tính và các điểm nổi bật của từng chặng.
3. **Điều phối và Khảo sát ý kiến bạn bè (Coordinated Planning):**
   - **Trang chia sẻ công khai (`/plans/shared`):** Người tham gia không cần tài khoản vẫn có thể mở link để xem lộ trình và tích chọn khung giờ mình có thể tham gia.
   - **Trang tổng hợp phản hồi (`/plans/responses`):** Giúp chủ trì buổi hẹn xem bảng biểu các khung giờ trùng nhau của các thành viên để chốt lịch hẹn thuận tiện nhất.

---

## 2. Kết quả kiểm thử & Đánh giá chất lượng

- **Biên dịch Frontend:** Đã chạy build kiểm thử thành công, bundle tối ưu, không có lỗi runtime hay thiếu sót component/thư viện.
- **Tính nhất quán dữ liệu:** Toàn bộ API Backend (Laravel Sanctum, Eloquent, Repositories, Policies) liên kết chặt chẽ với tầng Data Access Layer phía React (`RepositoryManager`).
- **Trải nghiệm người dùng:** Giao diện đồng nhất với bản thiết kế, bố cục responsive tốt trên cả thiết bị di động và máy tính để bàn.


