# Dialog Auto-Dismiss Helper

Tất cả dialog trong dự án sẽ tự động đóng sau 2 giây.

## Cách sử dụng

### Thay thế `showDialog`:

**Trước:**
```dart
showDialog(
  context: context,
  builder: (context) => MyDialog(),
);
```

**Sau:**
```dart
context.showAutoDismissDialog(
  builder: (context) => MyDialog(),
);
```

### Thay thế `showModalBottomSheet`:

**Trước:**
```dart
showModalBottomSheet(
  context: context,
  builder: (context) => MyBottomSheet(),
);
```

**Sau:**
```dart
context.showAutoDismissBottomSheet(
  builder: (context) => MyBottomSheet(),
);
```

## Tùy chỉnh thời gian auto-dismiss

Mặc định là 2 giây, nhưng có thể thay đổi:

```dart
context.showAutoDismissDialog(
  autoDismissDuration: Duration(seconds: 5), // 5 giây
  builder: (context) => MyDialog(),
);
```

## Đã được cập nhật

Các file sau đã được cập nhật để sử dụng auto-dismiss:
- `simple_dialog.dart`
- `report_dialog.dart`
- `place_detail_screen.dart`

## Lưu ý

- Dialog sẽ tự động đóng sau 2 giây (mặc định)
- User vẫn có thể đóng dialog bằng cách tap vào barrier hoặc nút đóng
- Nếu dialog cần user interaction (như input form), có thể tắt auto-dismiss bằng cách set `autoDismissDuration` lớn hơn hoặc không sử dụng helper này

