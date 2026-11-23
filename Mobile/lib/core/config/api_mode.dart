import 'dart:io';

/// Enum định nghĩa các API mode của app
enum ApiMode {
  production,
  dev,
  local;

  /// Tên hiển thị của mode
  String get displayName {
    switch (this) {
      case ApiMode.production:
        return 'PRODUCTION';
      case ApiMode.dev:
        return 'DEV';
      case ApiMode.local:
        return 'LOCAL';
    }
  }

  /// Base URL gốc tương ứng với từng mode (KHÔNG có `/api/` phía sau)
  String get baseUrl {
    switch (this) {
      case ApiMode.production:
        return 'https://main.be.trove.id.vn/';
      case ApiMode.dev:
        // Có thể đổi sang staging/dev riêng nếu cần
        return 'https://bedev.trove.id.vn/';
      case ApiMode.local:
        // Dùng IP khác nhau cho emulator / simulator / device thật
        if (Platform.isAndroid) {
          // Android emulator
          return 'http://10.0.2.2:8000/';
        } else {
          // iOS simulator, desktop, v.v.
          return 'http://localhost:8000/';
        }
    }
  }
}
