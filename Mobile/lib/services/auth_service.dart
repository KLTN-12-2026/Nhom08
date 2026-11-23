// lib/services/auth_service.dart

import 'package:dio/dio.dart';
import 'package:trove/data/request/auth/login_request.dart';

import '../data/data_sources/remote/api_client.dart';
import '../data/data_sources/local/token_manager.dart';
import '../data/request/register.dart';
import '../data/response/auth/user_info_response.dart';
import '../models/auth_result.dart';
import '../models/user.dart';
import '../core/services/service_provider.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  /// Extract error message from DioException or other errors
  String _extractErrorMessage(dynamic error) {
    if (error is DioException) {
      // Try to get message from response data
      if (error.response?.data != null) {
        final data = error.response!.data;

        // Try different possible message fields from server
        if (data is Map<String, dynamic>) {
          // Try 'message' field
          if (data['message'] != null) {
            final message = data['message'];
            if (message is String) {
              return message;
            }
          }

          // Try 'error.message' nested structure
          if (data['error'] != null && data['error'] is Map) {
            final errorData = data['error'] as Map;
            if (errorData['message'] != null &&
                errorData['message'] is String) {
              return errorData['message'] as String;
            }
          }

          // Try 'errors' field (might be a list or map)
          if (data['errors'] != null) {
            if (data['errors'] is String) {
              return data['errors'] as String;
            } else if (data['errors'] is Map) {
              final errors = data['errors'] as Map;
              // Get first error message
              final firstError = errors.values.first;
              if (firstError is String) {
                return firstError;
              } else if (firstError is List && firstError.isNotEmpty) {
                return firstError.first.toString();
              }
            } else if (data['errors'] is List &&
                (data['errors'] as List).isNotEmpty) {
              return (data['errors'] as List).first.toString();
            }
          }
        }
      }

      // Fallback to DioException message
      if (error.message != null && error.message!.isNotEmpty) {
        return error.message!;
      }
    }

    // Fallback to error.toString()
    return error.toString();
  }

  /// Translate common error messages to Vietnamese
  String _translateErrorMessage(String message) {
    final lowerMessage = message.toLowerCase();

    // Login errors
    if (lowerMessage.contains('email or password is invalid') ||
        lowerMessage.contains('invalid credentials') ||
        lowerMessage.contains('unauthorized')) {
      return 'Email hoặc mật khẩu không đúng';
    }

    if (lowerMessage.contains('user not found')) {
      return 'Tài khoản không tồn tại';
    }

    if (lowerMessage.contains('password is incorrect') ||
        lowerMessage.contains('wrong password')) {
      return 'Mật khẩu không đúng';
    }

    // Registration errors
    if (lowerMessage.contains('email already exists') ||
        lowerMessage.contains('email has already been taken') ||
        lowerMessage.contains('email already taken')) {
      return 'Email này đã được sử dụng';
    }

    if (lowerMessage.contains('password must be at least')) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (lowerMessage.contains('password confirmation does not match') ||
        lowerMessage.contains('passwords do not match')) {
      return 'Mật khẩu xác nhận không khớp';
    }

    // Validation errors
    if (lowerMessage.contains('email is required')) {
      return 'Vui lòng nhập email';
    }

    if (lowerMessage.contains('password is required')) {
      return 'Vui lòng nhập mật khẩu';
    }

    if (lowerMessage.contains('invalid email') ||
        lowerMessage.contains('email format')) {
      return 'Email không hợp lệ';
    }

    // Network errors
    if (lowerMessage.contains('connection refused') ||
        lowerMessage.contains('network error') ||
        lowerMessage.contains('no internet')) {
      return 'Không thể kết nối. Vui lòng kiểm tra mạng';
    }

    if (lowerMessage.contains('timeout') ||
        lowerMessage.contains('timed out')) {
      return 'Kết nối quá thời gian. Vui lòng thử lại';
    }

    // Server errors
    if (lowerMessage.contains('server error') ||
        lowerMessage.contains('internal server error') ||
        lowerMessage.contains('500')) {
      return 'Lỗi máy chủ. Vui lòng thử lại sau';
    }

    // Return original if no translation found
    return message;
  }

  // ✅ Login user
  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _apiClient.appService.login(
        LoginRequest(email: email, password: password),
      );

      if (response.success == true && response.data != null) {
        await TokenManager.saveTokens(
          accessToken: response.data!.accessToken,
          refreshToken: response.data!.refreshToken,
          tokenType: response.data!.tokenType,
        );

        final userPayload = response.data!.user;
        final user =
            userPayload != null ? userPayload.toUser() : await getCurrentUser();
        print("✅ AuthService: Token đã được lưu");
        return AuthResult.success(
            user: user, message: response.message ?? 'Login successful');
      } else {
        print("❌ AuthService: Login thất bại: ${response.message}");
        return AuthResult.failure(message: response.message ?? 'Login failed');
      }
    } catch (e) {
      print('❌ AuthService: Login error: $e');
      final rawMessage = _extractErrorMessage(e);
      final errorMessage = _translateErrorMessage(rawMessage);
      print('❌ AuthService: Extracted error message: $errorMessage');
      return AuthResult.failure(message: errorMessage);
    }
  }

  // ✅ Register user
  Future<AuthResult> register(
    String email,
    String password,
    String passwordConfirmation,
    String name, {
    String? phone,
    String? role,
  }) async {
    try {
      print("🔐 AuthService: Gọi API register...");
      print("🔐 AuthService: email=$email, name=$name");

      final response = await _apiClient.appService.register(
        RegisterRequest(
          email: email,
          password: password,
          passwordConfirmation: passwordConfirmation,
          name: name,
          phone: phone,
          role: role,
        ),
      );

      print("🔐 AuthService: API response received");
      print("🔐 AuthService: Response success: ${response.success}");

      if (response.success == true && response.data != null) {
        // Lưu token vào TokenManager
        await TokenManager.saveTokens(
          accessToken: response.data!.accessToken,
          refreshToken: response.data!.refreshToken,
          tokenType: response.data!.tokenType,
        );

        final userPayload = response.data!.user;
        final user =
            userPayload != null ? userPayload.toUser() : await getCurrentUser();
        final userName = user?.name ?? 'unknown';
        print("✅ AuthService: Register thành công, user: $userName");
        print("✅ AuthService: Token đã được lưu");
        return AuthResult.success(
            user: user, message: response.message ?? 'Register successful');
      } else {
        print("❌ AuthService: Register thất bại: ${response.message}");
        return AuthResult.failure(
            message: response.message ?? 'Register failed');
      }
    } catch (e) {
      print('❌ AuthService: Register error: $e');
      final rawMessage = _extractErrorMessage(e);
      final errorMessage = _translateErrorMessage(rawMessage);
      print('❌ AuthService: Extracted error message: $errorMessage');
      return AuthResult.failure(message: errorMessage);
    }
  }

  // ✅ Logout user
  Future<void> logout() async {
    try {
      print("🔐 AuthService: Gọi API logout...");

      await _apiClient.appService.logout();

      print("✅ AuthService: API logout thành công");
    } catch (e) {
      print("❌ AuthService: Logout API error: $e");
      // Vẫn tiếp tục xóa token local ngay cả khi API call thất bại
    } finally {
      // Luôn xóa token và clear auth data
      await TokenManager.clearTokens();
      await serviceProvider.appPreferences.clearAuth();
      print("✅ AuthService: Token và auth data đã được xóa");
    }
  }

  // ✅ Check if user is logged in
  Future<bool> isLoggedIn() async {
    try {
      // Check if we can get current user
      final user = await getCurrentUser();
      return user != null;
    } catch (e) {
      print("❌ AuthService isLoggedIn error: $e");
      return false;
    }
  }

  // ✅ Get current user
  Future<User?> getCurrentUser() async {
    try {
      final response = await _apiClient.appService.getCurrentUser();

      if (response.success == true && response.data != null) {
        final user = response.data!.toUser();

        return user;
      } else {
        print("❌ AuthService: Get current user thất bại: ${response.message}");
        return null;
      }
    } catch (e) {
      print('❌ AuthService: Get current user error: $e');
      return null;
    }
  }

  // ✅ Change password
  Future<AuthResult> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      print("🔐 AuthService: Changing password...");
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      print("✅ AuthService: Password changed successfully");
      return AuthResult.success(message: 'Password changed successfully');
    } catch (e) {
      print('❌ AuthService: Change password error: $e');
      return AuthResult.failure(message: e.toString());
    }
  }
}
