# BÁO CÁO TIẾN ĐỘ LẦN 1

- **Đề tài:** Xây dựng Trove – hệ thống lên kế hoạch gặp gỡ dựa trên AI và dữ liệu trải nghiệm cộng đồng
- **Nhóm:** Nhom08
- **GVHD:** TS. Đặng Việt Hùng
- **Ngày báo cáo:** 23/10/2026

---

## 1. Công việc đã hoàn thành

### 1.1. Tạo tài liệu Proposal

- Hoàn thành tài liệu đề xuất dự án (Project Proposal).
- File: [`TaiLieu/SCI_SE_01.ProjectProposal.docx`](../TaiLieu/SCI_SE_01.ProjectProposal.docx)

### 1.2. Khởi tạo dự án Frontend (thư mục `FE`)

- Khởi tạo project ReactJS (Create React App – `react-scripts` 5).
- Cài đặt và cấu hình các thư viện chính:
  - React 18, React Router DOM v6
  - Ant Design 5, Tailwind CSS 3 (kèm PostCSS, Autoprefixer)
  - Zustand (quản lý state), Axios (gọi API)
  - Day.js, React Hot Toast, Font Awesome
- Cấu hình Tailwind theo bộ nhận diện của Trove (màu chủ đạo, font Outfit).
- Tạo sẵn cấu trúc thư mục: `components`, `data`, `hooks`, `layouts`, `locales`, `pages`, `stores`, `utils`.
- Tạo trang demo `pages/Home/HomePage.jsx`, chạy `npm start` thành công.

### 1.3. Khởi tạo dự án Backend (thư mục `BE`)

- Khởi tạo project Laravel 12 (PHP 8.2).
- Cài đặt các package chính qua Composer:
  - Laravel Sanctum (xác thực API)
  - Laravel Scout, Meilisearch, Elasticsearch (tìm kiếm)
  - L5-Swagger (tài liệu API)
  - Cloudinary (lưu trữ ảnh), Maatwebsite Excel, Pusher
- Tạo sẵn cấu trúc thư mục theo mô hình: Controllers → Services → Repositories → Models.
- Cấu hình kết nối cơ sở dữ liệu MySQL (`trove_db`).
- Kiểm tra `php artisan` và `php artisan migrate` hoạt động bình thường.

### 1.4. Quản lý mã nguồn

- Đẩy mã nguồn FE và BE lên GitHub: https://github.com/KLTN-12-2026/Nhom08

