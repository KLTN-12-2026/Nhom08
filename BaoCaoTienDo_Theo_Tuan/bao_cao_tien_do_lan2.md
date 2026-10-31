# BÁO CÁO TIẾN ĐỘ LẦN 2

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 31/10/2026

---

## 1. Công việc đã hoàn thành trong đợt 2

Trong tuần qua, nhóm đã tập trung triển khai và hoàn thiện giao diện (Frontend) cùng hệ thống API (Backend) cho phân hệ Quản trị (Admin Panel), đồng thời cập nhật đầy đủ tài liệu thiết kế hệ thống.

### 1.1. Hoàn thiện tài liệu dự án

- Bổ sung và cập nhật tài liệu đặc tả User Stories, phân chia Product Backlog chi tiết theo các Sprint.
- Hoàn thiện tài liệu thiết kế cơ sở dữ liệu (Database Document), quan hệ bảng và các ràng buộc dữ liệu.

### 1.2. Phát triển & Tích hợp các phân hệ Quản trị (Admin Panel)

#### 1. Xác thực & Đăng nhập Quản trị viên (Admin Login)

- **Frontend:** Xây dựng màn hình đăng nhập Admin chuyên biệt (`/admin/login`) với giao diện hiện đại, xử lý xác thực form, lưu trữ token đăng nhập bảo mật trong `localStorage` và bảo vệ các tuyến đường riêng (`ProtectedRoute`).
- **Backend:** Xây dựng API `POST /api/admin/login`, kiểm tra quyền hạn tài khoản (chỉ tài khoản có `role = admin` mới được cấp quyền), tạo `admin_auth_token` qua Laravel Sanctum kèm cơ chế Refresh Token.

#### 2. Quản lý Người dùng (Users Management)

- **Frontend:**
  - Bảng danh sách người dùng hiển thị trực quan thông tin tài khoản, avatar, vai trò, ví điểm tích lũy, thống kê hoạt động (địa điểm, bài đăng, đánh giá) và trạng thái.
  - Bộ lọc đa tiêu chí: Tìm kiếm theo từ khóa (tên/email), lọc theo vai trò (Admin/User), lọc trạng thái hoạt động và trạng thái khóa.
  - Đầy đủ chức năng CRUD:
    - **Create / Update:** Form Drawer thêm mới và cập nhật người dùng với validation chặt chẽ.
    - **Read:** Drawer hiển thị chi tiết hồ sơ người dùng và thống kê chi tiết.
    - **Delete:** Hỗ trợ xóa đơn lẻ và xóa hàng loạt (Bulk Delete) kèm cảnh báo an toàn.
    - **Block / Unblock:** Chuyển đổi trạng thái chặn tài khoản trực tiếp ngay trên bảng.
- **Backend:** Xây dựng `Admin\UserController`, `UserService`, `UserRepository`, `UserPolicy` và `AdminMiddleware`. Tự động thu hồi token khi người dùng bị khóa và ngăn chặn hành vi tự xóa/tự khóa chính mình.

#### 3. Quản lý Địa điểm (Places Management)

- **Frontend:**
  - Bảng danh sách địa điểm tổng quan với đầy đủ thông tin: hình ảnh, tên địa điểm, địa chỉ, khoảng giá, đánh giá trung bình, số lượt review và trạng thái phê duyệt (Đã duyệt, Chờ duyệt, Từ chối).
  - Bộ lọc nâng cao: Tìm kiếm theo tên/địa chỉ, lọc theo danh mục, nhóm hoạt động, khoảng giá và trạng thái duyệt.
  - Đầy đủ nghiệp vụ CRUD & Phê duyệt:
    - **Thêm mới / Cập nhật địa điểm:** Modal form nhập đầy đủ thông tin (tọa độ GPS, email/sđt liên hệ, danh mục, thẻ tag, nhóm hoạt động và tải lên nhiều hình ảnh).
    - **Xem chi tiết:** Modal hiển thị toàn bộ media, bản đồ vị trí, thông tin người đăng và danh sách đánh giá.
    - **Phê duyệt / Từ chối:** Thao tác duyệt nhanh hoặc từ chối địa điểm trực tiếp trên hệ thống kèm ghi chú phản hồi.
    - **Xóa địa điểm:** Xóa địa điểm vi phạm hoặc không hợp lệ.
- **Backend:** Xây dựng hệ thống API `Admin\PlaceController`, `PlaceService`, xử lý quan hệ nhiều-nhiều với Categories, Tags, Activity Groups và quản lý media qua Cloudinary.

#### 4. Thống kê & Báo cáo số liệu (Statistics)

- Dashboard hiển thị các thẻ chỉ số KPI quan trọng: Tổng người dùng, Tổng địa điểm, Lượt giao dịch ví điểm, Nhóm hoạt động đang chạy.
- Trực quan hóa dữ liệu bằng các biểu đồ xu hướng SVG tương tác:
  - Doanh thu hàng ngày (Daily Revenue Trend).
  - Xu hướng đăng ký người dùng mới (User Registration Trend).
  - Xu hướng thêm địa điểm mới (Places Added Trend).
  - Xu hướng giao dịch điểm thưởng (Transactions Trend).
  - Biểu đồ phân bổ địa điểm theo danh mục và cơ cấu người dùng theo vai trò.
  - Bảng xếp hạng các địa điểm có đánh giá cao nhất (Top Reviewed Places).
- Bộ lọc thời gian (RangePicker) cho phép tra cứu số liệu linh hoạt theo khoảng ngày tùy chọn.

#### 5. Quản lý Cấu hình hệ thống (Tags & Categories Management)

- **Quản lý Danh mục (Categories):**
  - Bảng danh mục với mã định danh (slug), tên hiển thị và mô tả.
  - Chức năng tìm kiếm danh mục theo từ khóa.
  - Đầy đủ CRUD: Thêm mới, chỉnh sửa thông tin hiển thị và xóa danh mục qua Drawer Form.
  - Backend tích hợp `CategoryController` kèm `CategoryPolicy` kiểm soát quyền quản trị.
- **Quản lý Thẻ (Tags):**
  - Quản lý danh sách tag phân loại địa điểm (ẩm thực, giải trí, check-in, lãng mạn...).
  - Hỗ trợ thêm mới, chỉnh sửa, gán nhãn màu sắc và xóa thẻ tag.

## 2. Kế hoạch trong đợt tiếp theo

1. **Hoàn thiện toàn bộ Sprint 1 của phân hệ Admin:**
   - Hoàn tất các màn hình và nghiệp vụ quản trị còn lại
   - Tiến hành kiểm thử toàn diện (Testing - Unit Test & Manual Test) toàn bộ chức năng Sprint 1 của Admin để đảm bảo hệ thống vận hành ổn định, chính xác và bảo mật.