# BÁO CÁO TIẾN ĐỘ LẦN 3

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 07/11/2026

---

## 1. Công việc đã hoàn thành trong đợt 3 (Hoàn tất Sprint 1 - Phân hệ Admin)

Trong tuần qua, nhóm đã tập trung hoàn thành 100% các phân hệ quản trị còn lại, đồng bộ toàn diện giữa Frontend (React/Ant Design/Zustand) và Backend (Laravel 12 API), đồng thời tiến hành kiểm thử toàn bộ các chức năng của **Sprint 1 (Phân hệ Quản trị - Admin Panel)**.

### 1.1. Hoàn thiện toàn bộ các phân hệ Admin (Frontend & Backend)

#### 1. Quản lý Nhóm hoạt động (Activity Groups Management)

- **Frontend (`/admin/activity-groups`):**
  - Hiển thị danh sách nhóm hoạt động (ăn uống, giải trí, cà phê, dã ngoại...).
  - Đầy đủ nghiệp vụ CRUD: Thêm mới, chỉnh sửa tên/mã/mô tả/icon, và xóa nhóm hoạt động.
  - Quản lý gán danh mục (Categories) liên kết với từng nhóm hoạt động.
- **Backend:** Xây dựng `Admin\ActivityGroupController`, `ActivityGroupPolicy`, `ActivityGroupService` và `ActivityGroupRepository`. Cung cấp đầy đủ các API RESTful và API đồng bộ danh mục (`POST /api/admin/activity-groups/{id}/categories`).

#### 2. Quản lý Câu trích dẫn & Thông điệp gợi ý (Quotes Management)

- **Frontend (`/admin/quotes`):**
  - Quản lý danh sách câu trích dẫn truyền cảm hứng hẹn hò, gợi ý tâm trạng người dùng.
  - Phân loại câu trích dẫn theo thể loại (Tình yêu, Bạn bè, Khám phá, Cuối tuần).
  - Thao tác CRUD và nút chuyển đổi nhanh trạng thái kích hoạt (`active`/`inactive`) trực tiếp trên bảng.
- **Backend:** Xây dựng `Admin\QuoteController`, `QuoteTypeEnum`, `QuotePolicy`, các API thêm, sửa, xóa và toggle trạng thái (`POST /api/admin/quotes/{id}/toggle`).

#### 3. Quản lý Thông báo hệ thống & Thông báo đẩy (Notifications Management)

- **Frontend (`/admin/notifications`):**
  - Danh sách lịch sử thông báo hệ thống đã phát hành kèm thông tin người nhận và thời gian gửi.
  - Drawer hiển thị chi tiết nội dung thông báo.
  - Modal gửi thông báo đa kênh:
    - Gửi đích danh cho 1 người dùng (tìm kiếm người dùng từ danh sách thật).
    - Gửi đồng loạt cho nhiều người dùng được chọn.
    - Phát thông báo toàn hệ thống (Broadcast).
    - Tùy chọn gửi kèm thông báo đẩy thời gian thực (Push Notification qua Firebase Cloud Messaging - FCM).
- **Backend:** Xây dựng `Admin\NotificationController`, `NotificationService`, `NotificationRepository` (tối ưu eager loading `with('user')`), `NotificationPolicy` và xử lý gửi FCM Push Notifications.

#### 4. Quản lý Banner & Popup trang chủ (Announcements Management)

- **Frontend (`/admin/announcements`):**
  - Quản lý các thông báo nổi bật hiển thị trên Client App: Banner đầu trang, Popup cảnh báo, Text thông báo chạy chữ.
  - Bộ lọc đa tiêu chí theo Loại thông báo (`banner`, `popup`, `text`) và Trạng thái (`active`, `inactive`).
  - Drawer Form thêm mới và cập nhật: Thiết lập độ ưu tiên hiển thị (`priority`), thời gian bắt đầu và kết thúc (`start_at`, `end_at`) có kiểm tra ràng buộc thời gian hợp lệ.
- **Backend:** Xây dựng `Admin\AnnouncementController`, `AnnouncementPolicy` và các API quản lý thông báo trang chủ.

#### 5. Quản lý Thẻ phân loại địa điểm (Tags Management)

- **Frontend (`/admin/tags`):**
  - Hiển thị danh sách thẻ gắn kèm địa điểm (romantic, chill-view, coffee-work, pet-friendly...).
  - Thống kê số lượng địa điểm đang gắn thẻ (`usage_count`) dạng Badge trực quan.
  - Thao tác CRUD thẻ tag: Tạo mới, cập nhật tên thẻ, mã slug, màu sắc nhận diện, icon FontAwesome và bật/tắt trạng thái hiển thị.
- **Backend:** Xây dựng `Admin\TagController`, `TagRepository`, `TagPolicy` kết nối trực tiếp với quan hệ địa điểm.

#### 6. Quản lý Hỗ trợ & Phản hồi người dùng (Tickets & Support Management)

- **Frontend (`/admin/support`, `/admin/tickets`):**
  - Quản lý danh sách vé phản hồi, báo lỗi và góp ý từ người dùng.
  - Phân loại yêu cầu có màu sắc và icon trực quan: _Đề xuất tính năng_, _Báo lỗi ứng dụng_, _Phàn nàn/góp ý_, _Hẹn gặp/trao đổi_.
  - Xem chi tiết nội dung phản ánh và phân công quản trị viên phụ trách (`Assigned Admin`).
  - Cập nhật tiến độ xử lý qua các trạng thái: _Mới tạo_ (Open), _Đang xử lý_ (In Progress), _Đã giải quyết_ (Resolved), _Đã đóng_ (Closed) kèm ghi chú của Admin (`admin_notes`).
- **Backend:** Xây dựng `Admin\TicketController`, `TicketPolicy`, `TicketRepository` phục vụ kiểm duyệt phản hồi khách hàng.

#### 7. Cấu hình Tham số Hệ thống (Settings & System Config)

- **Frontend (`/admin/settings`):**
  - **Giới hạn người dùng (User Limits):** Bật/tắt hạn mức tương tác hàng ngày theo phân hạng tài khoản (Standard / Premium).
  - **Tự động phê duyệt địa điểm (Place Auto Approve):** Cho phép bật chế độ tự động duyệt địa điểm mới đăng hoặc chuyển vào hàng đợi chờ Admin kiểm duyệt thủ công.
- **Backend:** Xây dựng `Admin\UserLimitController` và `Admin\PlaceConfigController`, lưu trữ cấu hình động trong bảng `configs`.

#### 8. Đồng bộ các giao diện bổ trợ khác

- Đã tích hợp các màn hình bổ trợ hoàn chỉnh:
  - **Dòng tiền & Doanh thu (`/admin/cashflow`):** Thống kê dòng tiền, doanh thu các gói dịch vụ và chi phí.
  - **Gói thành viên (`/admin/subscriptions`):** Quản lý thông tin gói đăng ký, trạng thái gia hạn RevenueCat.
  - **Bảng điều khiển KPI (`/admin/dashboard`):** Tổng hợp số liệu theo thời gian thực.
  - **Xem nhanh địa điểm cộng đồng (`/admin/public-places`):** Giao diện thẻ Card trực quan mô phỏng góc nhìn người dùng.
  - **Trang lỗi 404 (`/404`):** Trang điều hướng lỗi thân thiện khi sai đường dẫn.

---

### 1.2. Kết quả kiểm thử Sprint 1 (Testing)

Trong tuần qua, nhóm đã thực hiện kiểm thử toàn diện (Unit Test & Manual API/UI Test) trên toàn bộ 75 route API Admin và các trang giao diện tương ứng:

- **Xác thực & Phân quyền (Authentication & Authorization):**
  - Đã kiểm tra 100% Policy (`UserPolicy`, `PlacePolicy`, `TagPolicy`, `CategoryPolicy`, `ActivityGroupPolicy`, `QuotePolicy`, `TicketPolicy`, `NotificationPolicy`, `AnnouncementPolicy`).
  - Các tài khoản không phải Admin (`role !== 'admin'`) đều bị chặn đúng chuẩn mã lỗi `403 Forbidden` khi truy cập API quản trị.
- **Tính toàn vẹn dữ liệu (CRUD & Validation):**
  - Kiểm tra form validation chặt chẽ (độ dài chuỗi, định dạng ngày tháng, ràng buộc khóa ngoại giữa địa điểm - danh mục - thẻ tag).
  - Kiểm tra các thao tác xóa an toàn (Popconfirm xác nhận, kiểm tra ràng buộc không để mồ côi dữ liệu).
- **Giao diện & Trải nghiệm (UI/UX):**
  - Tải dữ liệu mượt mà, phân trang server-side chuẩn xác.
  - Bố cục responsive, hỗ trợ chế độ xem Dark Mode/Light Mode đồng bộ.
  - **Kết luận:** **Sprint 1 (Phân hệ Admin) đã hoàn thành đạt chuẩn yêu cầu kỹ thuật và nghiệp vụ.**

---

## 2. Kế hoạch trong đợt tiếp theo (Sprint 2 - Phân hệ Khách hàng trên Website)

Bắt đầu từ tuần tiếp theo, nhóm sẽ bước vào triển khai **Sprint 2**, tập trung xây dựng giao diện và trải nghiệm phía người dùng (Client Web)
