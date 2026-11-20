# BÁO CÁO TIẾN ĐỘ LẦN 5

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 21/11/2026

---

## 1. Tổng quan công việc đã hoàn thành trong đợt 5 (Hoàn tất Sprint 2 & Kiểm thử toàn diện Phân hệ Khách hàng trên Web)

Trong đợt làm việc này, nhóm đã **chính thức hoàn thành 100% Sprint 2: Phân hệ Khách hàng trên nền tảng Web (Customer Web Portal)** bao gồm đầy đủ các module tính năng từ cơ bản đến nâng cao, tích hợp trí tuệ nhân tạo (AI Chatbot), quản lý tài khoản, thanh toán gói VIP và tiến hành kiểm thử (Testing) toàn diện đảm bảo hệ thống vận hành ổn định trước khi chuyển sang giai đoạn phát triển ứng dụng di động.

---

## 2. Chi tiết các chức năng đã hoàn thiện trong Sprint 2

### 2.1. Quản lý Tài khoản cá nhân & Đổi mật khẩu (`/account`)
- **Quản lý hồ sơ cá nhân:** Xem và chỉnh sửa thông tin chi tiết (Họ và tên, Email, Số điện thoại, Giới tính, Ngày sinh, Tải lên và cập nhật ảnh đại diện Avatar).
- **Bảo mật & Đổi mật khẩu:** Form thay đổi mật khẩu an toàn với xác thực mật khẩu hiện tại, kiểm tra độ mạnh của mật khẩu mới và xác nhận mật khẩu.
- **Trạng thái thành viên:** Hiển thị trực quan cấp bậc thành viên (Free / VIP Vàng / VIP Kim Cương) kèm biểu tượng huy hiệu tương ứng.
- **Tích hợp đồng bộ:** Đồng bộ trạng thái người dùng với Zustand store (`useCustomerStore`) và API Backend Laravel Sanctum.

### 2.2. Quản lý Bài viết & Trải nghiệm cộng đồng (`/my-posts`)
- **Quản lý bài viết cá nhân:** Cho phép khách hàng quản lý danh sách các bài viết chia sẻ địa điểm, kinh nghiệm ăn uống, vui chơi do chính mình đăng tải.
- **Trạng thái kiểm duyệt:** Theo dõi trạng thái bài viết rõ ràng theo quy trình (Đã duyệt / Chờ kiểm duyệt / Bị từ chối).
- **Thao tác nhanh:** Xem chi tiết bài viết, chỉnh sửa nội dung bài viết và xóa bài viết cá nhân (tuân thủ phân quyền chặt chẽ từ phía Backend).

### 2.3. Quản lý Địa điểm yêu thích (`/favorites`)
- **Bộ sưu tập yêu thích:** Quản lý toàn bộ danh sách các quán cà phê, nhà hàng, điểm giải trí mà người dùng đã bấm lưu (Bookmark/Like).
- **Tương tác nhanh:** Xem nhanh mức giá, đánh giá sao, địa chỉ; hỗ trợ hủy lưu địa điểm (`Unfavorite`) chỉ với 1 click qua API `POST /api/favorite-places/toggle`.
- **Liên kết vòng quay:** Tự động đồng bộ danh sách địa điểm yêu thích làm dữ liệu đầu vào cho tính năng Vòng quay ngẫu nhiên (`/date/spin`).

### 2.4. Đóng góp ý tưởng & Hỗ trợ kỹ thuật (`/feedback` & `/support`)
- **Đóng góp ý tưởng / Phản hồi (`/feedback`):**
  - Cho phép người dùng gửi góp ý xây dựng ứng dụng theo các danh mục: Đề xuất tính năng mới, Báo cáo lỗi, Khiếu nại dịch vụ, Góp ý chung.
  - Phía Backend đã bổ sung `TicketType` enum và chuẩn hóa API Tiếp nhận ticket/ý kiến người dùng.
- **Gửi phiếu yêu cầu hỗ trợ (`/support`):** Form gửi sự cố kỹ thuật hoặc lỗi phát sinh trong quá trình sử dụng hệ thống, tự động gửi phản hồi xác nhận cho người dùng.

### 2.5. Trợ lý ảo AI tư vấn thông minh (Trove Smart AI Chatbot)
- **Widget Chatbot nổi:** Biểu tượng chatbot Trove tông màu vàng `#FFCB37` hiển thị xuyên suốt ở góc dưới màn hình trên toàn bộ giao diện khách hàng (`CustomerLayout`).
- **Tích hợp Google Gemini:** Kết nối trực tiếp với mô hình AI thế hệ mới của Google (`gemini-2.5-flash`), bảo mật API Key qua biến môi trường `REACT_APP_GEMINI_API_KEY`.
- **RAG cơ bản (Truy xuất dữ liệu thực tế):** Hệ thống tự động nạp danh sách địa điểm thực tế từ cơ sở dữ liệu (`RepositoryManager.places.getPublicPlaces`) làm bối cảnh để AI tư vấn chính xác tên quán, địa chỉ và món ăn đặc trưng.
- **Gợi ý nhanh & Điều hướng thông minh:** Cung cấp các câu hỏi mẫu gợi ý (tìm quán cafe làm việc, điểm hẹn hò lãng mạn, hướng dẫn lập kế hoạch) và tự động tạo Markdown link cho phép người dùng click chuyển hướng trực tiếp tới các trang chức năng (`/location`, `/plans`, `/date/spin`, `/feedback`).

### 2.6. Cổng Thanh toán & Nâng cấp Gói VIP Premium (`/premium` & `/payment`)
- **Bảng so sánh gói dịch vụ (`/premium`):** Trực quan hóa quyền lợi giữa gói Miễn phí, **VIP Vàng** (59.000đ/tháng) và **VIP Kim Cương** (199.000đ/tháng).
- **Thanh toán tự động bằng VietQR (`/payment`):**
  - Tự động sinh mã VietQR động chứa chính xác số tiền, số tài khoản ngân hàng và nội dung cú pháp chuyển khoản theo gói người dùng đã chọn.
  - Hỗ trợ cơ chế khấu trừ giá khi nâng cấp từ VIP Vàng lên VIP Kim Cương (chỉ thanh toán khoản chênh lệch 140.000đ).
  - Tích hợp giao diện quản lý Member Card VIP, ngày hết hạn và hạn mức tạo lịch trình AI.

## 3. Hoàn thiện Kiểm thử Sprint 2 (Testing & Quality Assurance)

Nhóm đã thực hiện kiểm thử toàn diện trên Phân hệ Khách hàng (Customer Web) với các hạng mục chính:

1. **Kiểm thử Chức năng (Functional Testing):**
   - Kiểm thử luồng Đăng nhập, Đăng ký, Đăng xuất, Lưu phiên và khôi phục token Sanctum.
   - Kiểm thử tìm kiếm, lọc đa tiêu chí (giá, khoảng cách GPS, danh mục) và phân trang tại trang Địa điểm.
   - Kiểm thử quy trình Đánh giá & Bình luận (Review/Rating): Xác thực quyền sửa/xóa bình luận đúng người dùng.
   - Kiểm thử logic Vòng quay may mắn (Spin Wheel) và thuật toán phân chia timeline tại Lập kế hoạch AI.
   - Kiểm thử luồng chọn gói, sinh mã QR thanh toán và quản lý trạng thái VIP.

2. **Kiểm thử Tương thích & Giao diện (Responsive & UI Testing):**
   - Kiểm tra hiển thị responsive trên các độ phân giải màn hình phổ biến (Desktop, Tablet, Mobile).
   - Kiểm tra chế độ Dark Mode / Light Mode trên tất cả các trang giao diện Khách hàng.

3. **Kiểm thử Tích hợp & Biên dịch (Build Verification):**
   - Toàn bộ source code Frontend React đã được build thành công (`npm run build` đạt Exit Code 0, không có lỗi runtime hay thiếu thư viện).
   - Các API Backend Laravel đều phản hồi chuẩn JSON format, có validation dữ liệu đầu vào và xử lý mã lỗi HTTP chuẩn mực.

---

## 4. Đánh giá tiến độ dự án

| Hạng mục / Phân hệ | Kế hoạch ban đầu | Tiến độ thực tế | Trạng thái |
|---|---|---|---|
| **Sprint 1: Phân hệ Quản trị (Admin Web)** | Tuần 1 - Tuần 3 | Hoàn tất 100% | **Đạt yêu cầu** |
| **Sprint 2: Phân hệ Khách hàng (Customer Web)** | Tuần 4 - Tuần 5 | Hoàn tất 100% (Tính năng + Testing) | **Đạt yêu cầu** |
| **Backend RESTful API & Cơ sở dữ liệu** | Xuyên suốt | Hoàn tất 100% các API phục vụ Web | **Đạt yêu cầu** |
| **Sprint 3: Ứng dụng Di động (Mobile App)** | Tuần 6 - Tuần 8 | Chuẩn bị khởi động | **Sẵn sàng** |

---

## 5. Mục tiêu và Kế hoạch tuần tới (Bắt đầu Sprint 3 - Ứng dụng Mobile)

Trong tuần tiếp theo, nhóm sẽ chính thức khởi động **Sprint 3: Phát triển ứng dụng di động Trove (Trove Mobile App)**:

1. **Khởi tạo và thiết lập dự án Mobile:**
   - Hoàn thiện cấu hình khung dự án (React Native / Flutter), cài đặt các thư viện định tuyến, quản lý state và UI components đồng bộ nhận diện Trove.
2. **Xây dựng module Xác thực & Khám phá trên Mobile:**
   - Triển khai màn hình Onboarding chào mừng, Đăng nhập, Đăng ký và Quên mật khẩu.
   - Xây dựng màn hình Trang chủ Mobile (Bottom Navigation, Banner gợi ý, Danh sách địa điểm nổi bật).
3. **Tích hợp API Backend:**
   - Tái sử dụng toàn bộ hệ sinh thái RESTful API đã hoàn thiện ở Sprint 1 & 2 để tích hợp dữ liệu vào Mobile App.
4. **Kiểm tra tương thích thiết bị:**
   - Chạy thử nghiệm trên máy ảo và thiết bị thật (Android / iOS) để đảm bảo trải nghiệm người dùng mượt mà và tối ưu hiệu năng.
