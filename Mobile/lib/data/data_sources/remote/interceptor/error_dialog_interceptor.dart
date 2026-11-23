import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:trove/presentation/widgets/dialogs/error_dialog.dart';
import 'package:trove/core/config/global_keys.dart';
import 'dart:convert';

/// Error Dialog Interceptor - Hiển thị dialog lỗi trong debug mode
class ErrorDialogInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Chỉ hiển thị dialog trong debug mode
    if (kDebugMode) {
      _showErrorDialog(err);
    }

    handler.next(err);
  }

  void _showErrorDialog(DioException err) {
    final context = navigatorKey.currentContext;
    if (context == null) {
      print('⚠️ Cannot show error dialog: Context is null');
      return;
    }

    // Phân loại lỗi
    final errorInfo = _categorizeError(err);

    // Hiển thị dialog
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => ErrorDialog(
        message: _buildErrorMessage(errorInfo),
        buttonText: 'Đóng',
        gifPath: 'assets/gifs/dog_spin.gif',
      ),
    );
  }

  ErrorInfo _categorizeError(DioException err) {
    String category;
    String title;
    String details;
    int? statusCode = err.response?.statusCode;

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
        category = '⏱️ TIMEOUT';
        title = 'Kết nối timeout';
        details = 'Không thể kết nối đến server trong thời gian cho phép';
        break;

      case DioExceptionType.sendTimeout:
        category = '⏱️ SEND TIMEOUT';
        title = 'Gửi dữ liệu timeout';
        details = 'Không thể gửi dữ liệu đến server';
        break;

      case DioExceptionType.receiveTimeout:
        category = '⏱️ RECEIVE TIMEOUT';
        title = 'Nhận dữ liệu timeout';
        details = 'Không nhận được phản hồi từ server';
        break;

      case DioExceptionType.badCertificate:
        category = '🔒 SSL ERROR';
        title = 'Lỗi chứng chỉ SSL';
        details = 'Chứng chỉ SSL không hợp lệ';
        break;

      case DioExceptionType.badResponse:
        category = '❌ BAD RESPONSE';
        title = _getHttpErrorTitle(statusCode);
        details = _extractErrorMessage(err.response?.data);
        break;

      case DioExceptionType.cancel:
        category = '🚫 CANCELLED';
        title = 'Request đã bị hủy';
        details = 'Yêu cầu đã bị hủy bỏ';
        break;

      case DioExceptionType.connectionError:
        category = '🌐 CONNECTION ERROR';
        title = 'Lỗi kết nối';
        details =
            'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng';
        break;

      case DioExceptionType.unknown:
      default:
        category = '❓ UNKNOWN ERROR';
        title = 'Lỗi không xác định';
        details = err.message ?? 'Đã xảy ra lỗi không xác định';
        break;
    }

    return ErrorInfo(
      category: category,
      title: title,
      details: details,
      statusCode: statusCode,
      url: err.requestOptions.uri.toString(),
      method: err.requestOptions.method,
      responseData: err.response?.data,
      requestData: err.requestOptions.data,
    );
  }

  String _getHttpErrorTitle(int? statusCode) {
    if (statusCode == null) return 'Lỗi HTTP';

    switch (statusCode) {
      case 400:
        return 'Bad Request (400)';
      case 401:
        return 'Unauthorized (401)';
      case 403:
        return 'Forbidden (403)';
      case 404:
        return 'Not Found (404)';
      case 405:
        return 'Method Not Allowed (405)';
      case 408:
        return 'Request Timeout (408)';
      case 409:
        return 'Conflict (409)';
      case 422:
        return 'Validation Error (422)';
      case 429:
        return 'Too Many Requests (429)';
      case 500:
        return 'Internal Server Error (500)';
      case 502:
        return 'Bad Gateway (502)';
      case 503:
        return 'Service Unavailable (503)';
      case 504:
        return 'Gateway Timeout (504)';
      default:
        return 'HTTP Error ($statusCode)';
    }
  }

  String _extractErrorMessage(dynamic data) {
    if (data == null) return 'Không có thông tin lỗi';

    try {
      if (data is Map) {
        // Thử các key phổ biến
        if (data.containsKey('message')) {
          return data['message'].toString();
        }
        if (data.containsKey('error')) {
          return data['error'].toString();
        }
        if (data.containsKey('errors')) {
          final errors = data['errors'];
          if (errors is Map) {
            // Lấy lỗi đầu tiên
            final firstError = errors.values.first;
            if (firstError is List && firstError.isNotEmpty) {
              return firstError.first.toString();
            }
            return firstError.toString();
          }
          return errors.toString();
        }
        // Nếu không có key nào, return toàn bộ data
        return _formatJson(data);
      }
      return data.toString();
    } catch (e) {
      return data.toString();
    }
  }

  String _buildErrorMessage(ErrorInfo info) {
    final buffer = StringBuffer();

    // Category và Title
    buffer.writeln('${info.category}');
    buffer.writeln('${info.title}\n');

    // Method và URL
    buffer.writeln('📍 ${info.method} ${info.url}\n');

    // Request Data
    if (info.requestData != null) {
      final requestStr = _formatJson(info.requestData);
      if (requestStr.length < 500) {
        buffer.writeln('📤 Request Payload:');
        buffer.writeln('$requestStr\n');
      }
    }

    // Status Code
    if (info.statusCode != null) {
      buffer.writeln('📊 Status: ${info.statusCode}\n');
    }

    // Details
    buffer.writeln('💬 ${info.details}');

    // Response Data (nếu có và không quá dài)
    if (info.responseData != null) {
      final responseStr = _formatJson(info.responseData);
      if (responseStr.length < 500) {
        buffer.writeln('\n📦 Response:');
        buffer.writeln(responseStr);
      }
    }

    return buffer.toString();
  }

  String _formatJson(dynamic data) {
    if (data == null) return 'null';

    try {
      if (data is String) {
        final jsonData = jsonDecode(data);
        return const JsonEncoder.withIndent('  ').convert(jsonData);
      } else if (data is Map || data is List) {
        return const JsonEncoder.withIndent('  ').convert(data);
      } else {
        return data.toString();
      }
    } catch (e) {
      return data.toString();
    }
  }
}

/// Class để lưu thông tin lỗi
class ErrorInfo {
  final String category;
  final String title;
  final String details;
  final int? statusCode;
  final String url;
  final String method;
  final dynamic responseData;
  final dynamic requestData;

  ErrorInfo({
    required this.category,
    required this.title,
    required this.details,
    this.statusCode,
    required this.url,
    required this.method,
    this.responseData,
    this.requestData,
  });
}
