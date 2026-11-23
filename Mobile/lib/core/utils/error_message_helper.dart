import 'package:flutter/foundation.dart';

/// Helper để parse error và trả về message thân thiện với người dùng
/// Chỉ hiển thị message chi tiết khi debug mode
class ErrorMessageHelper {
  /// Parse error và trả về message thân thiện
  static String getFriendlyMessage(dynamic error) {
    if (error == null) {
      return _getDefaultMessage();
    }

    final errorString = error.toString().toLowerCase();

    // Chỉ hiển thị chi tiết debug khi đang ở kDebugMode
    if (kDebugMode) {
      return _parseDebugMessage(errorString, error);
    }

    // Production mode: chỉ hiển thị message thân thiện, không có chi tiết kỹ thuật
    return _parseProductionMessage(errorString);
  }

  /// Parse message cho debug mode (có thể bao gồm thông tin chi tiết)
  static String _parseDebugMessage(String errorString, dynamic error) {
    // Network errors
    if (errorString.contains('socketexception') ||
        errorString.contains('network') ||
        errorString.contains('connection') ||
        errorString.contains('internet')) {
      return 'Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.\n[Debug: $error]';
    }

    // Timeout errors
    if (errorString.contains('timeout') || errorString.contains('timed out')) {
      return 'Kết nối quá lâu. Vui lòng thử lại sau.\n[Debug: $error]';
    }

    // Server errors (5xx)
    if (errorString.contains('500') ||
        errorString.contains('502') ||
        errorString.contains('503') ||
        errorString.contains('504')) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.\n[Debug: $error]';
    }

    // Client errors (4xx)
    if (errorString.contains('401') || errorString.contains('unauthorized')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.\n[Debug: $error]';
    }

    if (errorString.contains('403') || errorString.contains('forbidden')) {
      return 'Bạn không có quyền thực hiện thao tác này.\n[Debug: $error]';
    }

    if (errorString.contains('404') || errorString.contains('not found')) {
      return 'Không tìm thấy dữ liệu.\n[Debug: $error]';
    }

    // Generic error với debug info
    return 'Có lỗi xảy ra. Vui lòng thử lại sau.\n[Debug: $error]';
  }

  /// Parse message cho production mode (chỉ message thân thiện, không có chi tiết)
  static String _parseProductionMessage(String errorString) {
    // Network errors
    if (errorString.contains('socketexception') ||
        errorString.contains('network') ||
        errorString.contains('connection') ||
        errorString.contains('internet')) {
      return 'Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
    }

    // Timeout errors
    if (errorString.contains('timeout') || errorString.contains('timed out')) {
      return 'Kết nối quá lâu. Vui lòng thử lại sau.';
    }

    // Server errors (5xx)
    if (errorString.contains('500') ||
        errorString.contains('502') ||
        errorString.contains('503') ||
        errorString.contains('504')) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }

    // Client errors (4xx)
    if (errorString.contains('401') || errorString.contains('unauthorized')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (errorString.contains('403') || errorString.contains('forbidden')) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }

    if (errorString.contains('404') || errorString.contains('not found')) {
      return 'Không tìm thấy dữ liệu.';
    }

    // Generic error message
    return _getDefaultMessage();
  }

  /// Message mặc định khi không xác định được loại lỗi
  static String _getDefaultMessage() {
    return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
  }
}
