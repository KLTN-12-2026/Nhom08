# Hướng Dẫn Deploy Website Lên aaPanel

## 📦 Files cần deploy
- `index.html` - Trang chính
- `styles.css` - File CSS

## 🚀 Các Bước Deploy

### 1. Đăng nhập vào aaPanel
- Truy cập: `http://your-server-ip:7800` hoặc `https://your-domain:7800`
- Đăng nhập với tài khoản admin

### 2. Tạo Website Mới (nếu chưa có)

#### Option A: Tạo website từ giao diện
1. Click vào **Website** trong menu bên trái
2. Click nút **Add site**
3. Điền thông tin:
   - **Domain**: Nhập domain của bạn (vd: `bostonlesjak.com`)
   - **Root Directory**: Để mặc định hoặc chọn `/www/wwwroot/your-domain`
   - **PHP Version**: Chọn "Pure static" (vì đây là website HTML tĩnh)
4. Click **Submit**

### 3. Upload Files Lên Server

#### Option A: Sử dụng File Manager của aaPanel (Đơn giản nhất)
1. Trong aaPanel, click **Files** ở menu bên trái
2. Navigate đến thư mục website của bạn:
   ```
   /www/wwwroot/your-domain/
   ```
3. Xóa file `index.html` mặc định nếu có
4. Click nút **Upload** ở góc trên bên phải
5. Chọn và upload 2 files:
   - `index.html`
   - `styles.css`

#### Option B: Sử dụng FTP/SFTP
1. Trong aaPanel, vào **FTP** → **Add FTP**
2. Tạo tài khoản FTP cho website
3. Sử dụng FileZilla hoặc FTP client khác:
   - Host: IP server của bạn
   - Username: FTP username vừa tạo
   - Password: FTP password vừa tạo
   - Port: 21 (FTP) hoặc 22 (SFTP)
4. Upload files vào thư mục `/www/wwwroot/your-domain/`

#### Option C: Sử dụng SSH/SCP (Nhanh nhất)
```bash
# Từ máy local, chạy lệnh:
scp index.html styles.css root@your-server-ip:/www/wwwroot/your-domain/

# Hoặc nếu dùng user khác:
scp index.html styles.css username@your-server-ip:/www/wwwroot/your-domain/
```

### 4. Kiểm Tra Website
1. Mở trình duyệt
2. Truy cập domain của bạn: `http://your-domain.com`
3. Website sẽ hiển thị

### 5. Cài Đặt SSL (HTTPS) - Khuyến nghị

1. Trong aaPanel, click **Website**
2. Click vào website của bạn
3. Chọn tab **SSL**
4. Chọn **Let's Encrypt** (miễn phí)
5. Nhập email của bạn
6. Click **Apply**
7. Sau khi cài đặt xong, bật **Force HTTPS**

## 🔧 Cấu Hình Nginx (Tùy chọn)

Nếu muốn tối ưu thêm, có thể chỉnh sửa Nginx config:

1. Trong aaPanel, **Website** → Click domain → **Config**
2. Thêm vào trong block `server {}`:

```nginx
# Bật gzip compression
gzip on;
gzip_types text/css application/javascript image/svg+xml;
gzip_min_length 1000;

# Cache static files
location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

3. Click **Save**
4. Reload Nginx: **Nginx** → **Reload**

## 📱 Kiểm Tra Responsive
- Test trên mobile: `https://www.responsinator.com`
- Hoặc dùng Chrome DevTools (F12) → Toggle device toolbar

## ✅ Checklist Hoàn Thành
- [ ] Website hiển thị đúng trên domain
- [ ] SSL đã được cài đặt (HTTPS)
- [ ] Test responsive trên mobile
- [ ] Kiểm tra form liên hệ hoạt động
- [ ] Kiểm tra tốc độ load: https://pagespeed.web.dev

## 🎯 Lưu Ý Quan Trọng
- Backup files trước khi deploy
- Đảm bảo permissions đúng: `chmod 644` cho files, `chmod 755` cho folders
- Nếu dùng domain mới, đợi DNS propagate (24-48h)

## 🔍 Troubleshooting

### Website không hiển thị?
```bash
# SSH vào server, kiểm tra:
cd /www/wwwroot/your-domain/
ls -la

# Check permissions
chmod 644 index.html styles.css
chown www:www index.html styles.css
```

### CSS không load?
- Kiểm tra file `styles.css` có cùng thư mục với `index.html`
- Clear browser cache (Ctrl + F5)
- Check Network tab trong Chrome DevTools

## 📞 Hỗ Trợ
Nếu gặp vấn đề, kiểm tra:
1. Error logs trong aaPanel: **Website** → Click domain → **Log**
2. Nginx error log: `/www/wwwlogs/your-domain-error.log`
