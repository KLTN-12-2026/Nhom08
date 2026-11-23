import 'package:trove/core/config/api_mode.dart';

class Constant {
  /// Base URL gốc (không có `/api/`) dùng cho các nơi legacy.
  /// Nguồn duy nhất: `ApiMode.production.baseUrl`.
  static String get baseUrl {
    final apiBase = ApiMode.production.baseUrl;
    // Loại bỏ `/api/` ở cuối nếu có
    if (apiBase.endsWith('/api/')) {
      return apiBase.substring(0, apiBase.length - '/api/'.length) + '/';
    }
    return apiBase;
  }

  static const String urlProvince = "https://provinces.open-api.vn/api/";
  static const String token = "tokenExample";
}
