import 'dart:convert';

import 'package:dio/dio.dart';
import '../../local/app_prefs.dart';

/// Interceptor for adding authentication and security headers to Dio requests.
class AuthInterceptor extends InterceptorsWrapper {
  final AppPreferences appPreferences;

  AuthInterceptor(this.appPreferences);
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['fr-app'] = 'obdata';
    final token = appPreferences.getAuthToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    // Check for MultipartFile and convert data to FormData if necessary
    if (_hasMultipartData(options)) {
      options.data = FormData.fromMap(options.data as Map<String, dynamic>);
    }

    handler.next(options); // Continue with the request
  }

  @override
  void onError(DioError error, ErrorInterceptorHandler handler) {
    // Basic 401 handling: clear auth to force re-login. Implement refresh flow later if needed.
    if (error.response?.statusCode == 401) {
      appPreferences.clearAuth();
    }
    handler.next(error); // Continue with the error
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (response.data is String) {
      try {
        response.data = json.decode(response.data);
      } on FormatException {
        // ignore
      }
    }

    // Handle business logic based on response codes

    handler.next(response); // Continue with the response
  }

  /// Check if the request contains MultipartFile data
  bool _hasMultipartData(RequestOptions options) {
    if (options.data is Map) {
      return (options.data as Map)
          .values
          .any((element) => element is MultipartFile);
    }
    return false;
  }
}
