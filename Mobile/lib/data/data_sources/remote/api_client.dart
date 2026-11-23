import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:trove/data/request/refresh_token.dart';

import '../local/token_manager.dart';
import 'app_api.dart';
import '../../../core/config/global_keys.dart';
import 'interceptor/error_dialog_interceptor.dart';

class ApiClient {
  late Dio _dio;
  late AppServiceClient _appService;
  bool _isRefreshing = false;
  final List<Future Function()> _pendingRequests = [];

  ApiClient({required String baseUrl, Function()? onTokenExpired}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    final String normalizedBase = baseUrl.endsWith('/') ? baseUrl : '$baseUrl/';
    final String apiBase = '${normalizedBase}api/';
    _appService = AppServiceClient(_dio, baseUrl: apiBase);

    // Thêm interceptors
    _dio.interceptors.addAll([
      _AuthInterceptor(this),
      if (kDebugMode)
        // ErrorDialogInterceptor(), // Hiển thị dialog lỗi trong debug mode
        if (kDebugMode) _LogInterceptor(),
    ]);
  }

  Dio get dio => _dio;
  AppServiceClient get appService => _appService;

  /// Cập nhật baseUrl của API client
  void updateBaseUrl(String newBaseUrl) {
    final String normalizedBase =
        newBaseUrl.endsWith('/') ? newBaseUrl : '$newBaseUrl/';

    // Cập nhật Dio baseUrl
    _dio.options.baseUrl = normalizedBase;

    // Cập nhật AppServiceClient baseUrl
    final String apiBase = '${normalizedBase}api/';
    _appService = AppServiceClient(_dio, baseUrl: apiBase);

    print('✅ ApiClient: BaseUrl updated to $normalizedBase');
  }

  // Xử lý refresh token
  Future<bool> _handleTokenRefresh() async {
    if (_isRefreshing) {
      // Nếu đang refresh, đợi
      return await Future.delayed(const Duration(milliseconds: 100), () async {
        return await _handleTokenRefresh();
      });
    }

    _isRefreshing = true;

    try {
      final refreshTokenValue = await TokenManager.getRefreshToken();
      if (refreshTokenValue == null) {
        _isRefreshing = false;
        return false;
      }

      final request = RefreshTokenRequest(refreshToken: refreshTokenValue);
      final response = await _appService.refreshToken(request);

      if (response.success == true && response.data != null) {
        await TokenManager.saveTokens(
          accessToken: response.data!.accessToken,
          refreshToken: response.data!.refreshToken,
          tokenType: response.data!.tokenType,
        );
        _isRefreshing = false;

        // Thực hiện lại các request đang chờ
        for (final request in _pendingRequests) {
          await request();
        }
        _pendingRequests.clear();

        return true;
      }
      _isRefreshing = false;
      return false;
    } catch (e) {
      _isRefreshing = false;
      _pendingRequests.clear();

      // Xóa token và điều hướng về login
      await TokenManager.clearTokens();
      _navigateToLogin();

      return false;
    }
  }

  void _navigateToLogin() {
    print('Token expired, redirecting to login...');
    handleTokenExpired();
  }
}

// Interceptor để tự động thêm token và xử lý refresh
class _AuthInterceptor extends Interceptor {
  final ApiClient _apiClient;

  _AuthInterceptor(this._apiClient);

  @override
  void onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    // Thêm token vào header nếu có
    final authHeader = await TokenManager.getAuthorizationHeader();
    if (authHeader != null) {
      options.headers['Authorization'] = authHeader;
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token hết hạn, thử refresh
      final refreshSuccess = await _apiClient._handleTokenRefresh();

      if (refreshSuccess) {
        // Refresh thành công, thử lại request cũ
        try {
          final newAuthHeader = await TokenManager.getAuthorizationHeader();
          if (newAuthHeader != null) {
            err.requestOptions.headers['Authorization'] = newAuthHeader;
          }

          final response = await _apiClient.dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        } catch (e) {
          // Nếu vẫn lỗi, trả về lỗi gốc
          handler.next(err);
          return;
        }
      }
    }

    handler.next(err);
  }
}

// Interceptor để log request/response (chỉ trong debug mode)
class _LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('🌐 REQUEST[${options.method}] => URL: ${options.uri}');
    print('Headers: ${options.headers}');
    print('Data: ${options.data}');

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print(
        '✅ RESPONSE[${response.statusCode}] => URL: ${response.requestOptions.uri}');
    print('Data Response: ${response.data}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print(
        '❌ ERROR[${err.response?.statusCode}] => URL: ${err.requestOptions.uri}');
    print('Message: ${err.message}');
    if (err.response?.data != null) {
      print('Error Data: ${err.response?.data}');
    }
    handler.next(err);
  }
}
