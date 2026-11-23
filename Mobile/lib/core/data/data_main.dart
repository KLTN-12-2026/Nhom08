// lib/core/data/data_main.dart
import '../../models/user.dart';
import '../../data/data_sources/remote/api_client.dart';
import '../../data/response/auth/user_info_response.dart';

/// DataMain - Lưu trữ thông tin cần thiết xuyên suốt app
/// Singleton pattern để có thể truy cập từ bất kỳ đâu
class DataMain {
  static final DataMain _instance = DataMain._internal();
  factory DataMain() => _instance;
  DataMain._internal();

  // ✅ User information
  User? _currentUser;
  int? _userId;

  // ✅ Getters
  User? get currentUser => _currentUser;
  int? get userId => _userId;
  bool get isLoggedIn => _currentUser != null && _userId != null;
  

  // ✅ Load user info from API
  Future<void> loadUserInfo(ApiClient apiClient) async {
    try {
      print("🔍 DataMain: Đang load user info từ API...");
      final response = await apiClient.appService.getCurrentUser();
      final int? id = response.data?.id;

      if (id != null) {
        _userId = id;
        _currentUser = response.toUser();
        print(
            "✅ DataMain: Đã load user info - User ID: $_userId, Email: ${_currentUser?.email}");
      } else {
        print("⚠️ DataMain: Không thể lấy user_id từ response");
        _userId = null;
        _currentUser = null;
      }
    } catch (e) {
      print("❌ DataMain: Lỗi khi load user info: $e");
      _userId = null;
      _currentUser = null;
      rethrow;
    }
  }

  // ✅ Set user info directly (useful after login)
  void setUserInfo(User user) {
    _currentUser = user;
    _userId = int.tryParse(user.id);
    print(
        "✅ DataMain: Đã set user info - User ID: $_userId, Email: ${user.email}");
  }

  // ✅ Update user info
  void updateUserInfo(User user) {
    _currentUser = user;
    _userId = int.tryParse(user.id);
    print("✅ DataMain: Đã update user info - User ID: $_userId");
  }

  // ✅ Clear all data (useful when logout)
  void clear() {
    _currentUser = null;
    _userId = null;
    print("✅ DataMain: Đã clear tất cả data");
  }

  // ✅ Refresh user info from API
  Future<void> refreshUserInfo(ApiClient apiClient) async {
    await loadUserInfo(apiClient);
  }
}

// ✅ Global instance
final dataMain = DataMain();
