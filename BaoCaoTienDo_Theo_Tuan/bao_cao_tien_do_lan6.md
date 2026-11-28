# BÁO CÁO TIẾN ĐỘ LẦN 6

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 28/11/2026

---

## 1. Tổng quan công việc đã hoàn thành trong đợt 6 (Khởi động Sprint 3 - Phân hệ Ứng dụng Di động / Trove Mobile App)

Sau khi hoàn tất 100% Sprint 1 (Admin Web) và Sprint 2 (Customer Web), trong tuần vừa qua nhóm đã chính thức khởi động **Sprint 3: Phát triển ứng dụng di động Trove (Trove Mobile App trên nền tảng Flutter)**. Nhóm đã tập trung thiết lập kiến trúc ứng dụng di động, hoàn thiện toàn diện phân hệ Xác thực (Authentication) và phân hệ Quản lý & Khám phá Địa điểm (Places Management & Exploration).

---

## 2. Chi tiết các module tính năng đã hoàn thiện trên Mobile

### 2.1. Phân hệ Xác thực tài khoản người dùng (Mobile Authentication)
1. **Màn hình Đăng nhập & Đăng ký tích hợp (`auth_screen.dart`):**
   - Thiết kế giao diện hiện đại theo phong cách thương hiệu Trove với TabBar chuyển đổi mượt mà giữa Đăng nhập và Đăng ký.
   - **Form Đăng nhập:** Kiểm tra định dạng Email, trường Mật khẩu hỗ trợ nút bật/tắt ẩn hiện mật khẩu, tùy chọn "Ghi nhớ đăng nhập" và các phương thức đăng nhập nhanh qua bên thứ ba (Google, Apple, Facebook).
   - **Form Đăng ký:** Đầy đủ các trường Họ tên, Email, Mật khẩu, Xác nhận mật khẩu kèm validation tự động phát hiện lỗi sai định dạng hoặc mật khẩu không trùng khớp.
2. **Quy trình Quên mật khẩu & Đổi mật khẩu (`forgot_password_screen.dart` & `change_password_screen.dart`):**
   - Hỗ trợ gửi email khôi phục mật khẩu tài khoản người dùng an toàn và tiện lợi.
   - Form đổi mật khẩu mới với xác thực mật khẩu hiện tại.
3. **Quản lý trạng thái BLoC & Dịch vụ API (`AuthBloc` & `AuthService`):**
   - Xử lý các sự kiện `AuthLoginRequested`, `AuthRegisterRequested`, `AuthLogoutRequested` mượt mà.
   - Lưu trữ và đồng bộ trạng thái phiên làm việc của người dùng toàn cục (`DataMain`) và kết nối trực tiếp với hệ thống API Backend Laravel Sanctum.

---

### 2.2. Phân hệ Khám phá & Quản lý Địa điểm (Mobile Places)
1. **Màn hình Danh sách Địa điểm (`place_screen.dart`):**
   - Hiển thị danh sách các quán ăn, quán cà phê, điểm vui chơi thịnh hành.
   - Trực quan hóa hình ảnh đại diện, tên quán, đánh giá số sao, mức giá và khoảng cách GPS.
2. **Xem chi tiết Địa điểm (`place_detail_screen.dart`):**
   - Hiển thị chi tiết toàn diện: Giờ mở/đóng cửa, hotline, địa chỉ, mức giá trung bình và mô tả trải nghiệm.
   - Album hình ảnh thực tế dạng Carousel kèm chấm điều hướng (`image_carousel_with_dots.dart`).
   - Widget hiển thị điểm đánh giá sao nhanh và số lượng review cộng đồng (`quick_rating_widget.dart`).
3. **Chức năng Đăng địa điểm mới (`place_create_screen.dart`):**
   - Cho phép người dùng đóng góp địa điểm mới trực tiếp từ điện thoại.
   - Form nhập tên quán, chọn danh mục, nhóm hoạt động, mức giá, khung giờ hoạt động và vị trí bản đồ.
   - Hỗ trợ chọn ảnh từ thư viện hoặc chụp ảnh trực tiếp từ Camera điện thoại.
4. **Tìm kiếm địa điểm đa kênh:**
   - **Thanh tìm kiếm nhanh (`place_search_bar.dart`):** Tìm kiếm thời gian thực theo tên quán, địa chỉ và món ăn.
   - **Tìm kiếm trên bản đồ tương tác (`google_map_search_screen.dart`):** Tích hợp Google Maps, tự động ghim marker các địa điểm xung quanh và hiển thị card thông tin khi bấm vào từng điểm.
5. **Đánh giá & Bình luận địa điểm (Reviews & Ratings):**
   - **Bảng danh sách review (`review_sheet.dart`):** Modal BottomSheet hiển thị điểm sao trung bình và danh sách nhận xét thực tế từ cộng đồng.
   - **Viết đánh giá mới (`create_review_screen.dart`):** Chọn số sao đánh giá (1 - 5 ⭐), nhập nội dung cảm nhận chi tiết và đính kèm hình ảnh thực tế chụp tại quán.

---

## 3. Đánh giá tiến độ dự án

| Hạng mục / Phân hệ | Kế hoạch ban đầu | Tiến độ thực tế | Trạng thái |
|---|---|---|---|
| **Sprint 1: Phân hệ Quản trị (Admin Web)** | Tuần 1 - Tuần 3 | Hoàn tất 100% | **Đạt yêu cầu** |
| **Sprint 2: Phân hệ Khách hàng (Customer Web)** | Tuần 4 - Tuần 5 | Hoàn tất 100% (Tính năng + Testing) | **Đạt yêu cầu** |
| **Sprint 3: Ứng dụng Di động (Mobile App)** | Tuần 6 - Tuần 8 | Hoàn tất module Auth & Địa điểm | **Đúng lộ trình** |

---

## 4. Mục tiêu và Kế hoạch tuần tới

Trong tuần tiếp theo, nhóm sẽ **tiếp tục đẩy mạnh phát triển Sprint 3 (Mobile App)** với các mục tiêu trọng tâm:
1. **Phân hệ Lên kế hoạch thông minh trên Mobile (Mobile Smart Planning):**
   - Xây dựng giao diện tạo kế hoạch hẹn hò, đi chơi theo lịch trình tự động.
   - Tính năng mời bạn bè và khảo sát bình chọn khung giờ tham gia trên thiết bị di động.
2. **Tính năng Vòng quay ngẫu nhiên (Mobile Spin Wheel):**
   - Xây dựng giao diện vòng quay may mắn trên Flutter giúp người dùng lựa chọn ngẫu nhiên địa điểm ăn uống.
3. **Quản lý Hồ sơ cá nhân & Địa điểm yêu thích (Account & Favorites):**
   - Hoàn thiện màn hình thông tin cá nhân, danh sách bài viết đã đăng và danh sách các địa điểm đã lưu yêu thích.
