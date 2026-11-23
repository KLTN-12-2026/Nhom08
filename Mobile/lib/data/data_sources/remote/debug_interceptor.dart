import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'dart:convert';

/// Debug Interceptor để kiểm soát và debug request/response
class DebugInterceptor extends Interceptor {
  // Tắt debug logs
  static const bool _enableDebugLogs = false;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (!kDebugMode || !_enableDebugLogs) {
      handler.next(options);
      return;
    }

    print('🚀 REQUEST[${options.method}] => ${options.uri}');
    print('Headers: ${options.headers}');
    if (options.data != null) {
      print('Body: ${_formatJson(options.data)}');
    }
    print('');

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (!kDebugMode || !_enableDebugLogs) {
      handler.next(response);
      return;
    }

    print(
        '✅ RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}');
    print('Headers: ${response.headers.map}');
    if (response.data != null) {
      print('Body: ${_formatJson(response.data)}');
    }
    print('');

    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (!kDebugMode || !_enableDebugLogs) {
      handler.next(err);
      return;
    }

    print('❌ ERROR[${err.response?.statusCode}] => ${err.requestOptions.uri}');
    print('Message: ${err.message}');
    if (err.response?.data != null) {
      print('Error Body: ${_formatJson(err.response?.data)}');
    }
    print('');

    handler.next(err);
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
