import 'package:flutter/material.dart';

// Global key để truy cập Navigator từ bất kỳ đâu
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

// Global key để truy cập Scaffold từ bất kỳ đâu
final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

// Callback function để xử lý token expired
typedef TokenExpiredCallback = void Function();

// Global callback để xử lý token expired
TokenExpiredCallback? onTokenExpired;

// Function để set callback
void setTokenExpiredCallback(TokenExpiredCallback callback) {
  onTokenExpired = callback;
}

// Function để gọi callback
void handleTokenExpired() {
  onTokenExpired?.call();
}
