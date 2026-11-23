import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:trove/core/utils/error_message_helper.dart';
import 'package:trove/data/data_sources/remote/api_client.dart';

/// Service đơn giản quản lý FCM token và đồng bộ lên server.
/// - initAndGetToken: xin quyền (iOS), bật auto-init, trả về token.
/// - getToken: lấy token hiện tại.
/// - onTokenRefresh: lắng nghe refresh.
/// - syncTokenToServer: gửi token + platform lên API.
class FcmService {
  final FirebaseMessaging _messaging;
  final ApiClient _apiClient;

  FcmService({
    FirebaseMessaging? messaging,
    required ApiClient apiClient,
  })  : _messaging = messaging ?? FirebaseMessaging.instance,
        _apiClient = apiClient;

  Future<String?> initAndGetToken() async {
    await _messaging.requestPermission();
    await _messaging.setAutoInitEnabled(true);
    final token = await _messaging.getToken();
    if (kDebugMode) {
      print('📌 FCM init token: $token');
    }
    return token;
  }

  Future<String?> getToken() async {
    final token = await _messaging.getToken();
    if (kDebugMode) {
      print('📌 FCM current token: $token');
    }
    return token;
  }

  Stream<String> onTokenRefresh() => _messaging.onTokenRefresh;

  Future<void> syncTokenToServer(String token) async {
    final platform =
        Platform.isIOS ? 'ios' : (Platform.isAndroid ? 'android' : 'unknown');
    try {
      await _apiClient.appService.registerDeviceToken({
        'token': token,
        'platform': platform,
      });
      if (kDebugMode) {
        print('✅ FCM token synced: $token ($platform)');
      }
    } catch (e) {
      // Handle duplicate token error (422) gracefully
      // If the token already exists on the server, that's fine - don't throw
      if (e.toString().contains('422') ||
          e.toString().contains('already been taken')) {
        if (kDebugMode) {
          print('ℹ️ FCM token already registered: $token ($platform)');
        }
        return; // Success - token is already on server
      }

      final msg = ErrorMessageHelper.getFriendlyMessage(e);
      if (kDebugMode) {
        print('❌ FcmService: sync token failed: $msg');
      }
      rethrow;
    }
  }
}
