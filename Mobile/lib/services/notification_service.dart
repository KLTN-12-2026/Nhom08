import 'dart:io';
import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Background handler cho FCM (Android/iOS)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Chỉ khởi tạo Firebase; việc hiển thị notification nền được FCM đảm nhận
  await Firebase.initializeApp();
  debugPrint('📩 FCM background message: ${message.messageId}');
}

class NotificationService {
  // Singleton
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  // Public getter
  static NotificationService get instance => _instance;

  // Notification plugin
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // When notification is tapped
  final BehaviorSubject<String?> onNotificationClick =
      BehaviorSubject<String?>();

  /// ---------------------------------------------------------
  /// 1. INIT NOTIFICATION SERVICE
  /// ---------------------------------------------------------
  Future<void> init() async {
    // Đảm bảo Firebase đã sẵn sàng (idempotent)
    await Firebase.initializeApp();

    // Android
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestSoundPermission: false,
      requestBadgePermission: false,
      requestAlertPermission: false,
    );

    // Initialization
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await flutterLocalNotificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        final payload = response.payload;
        onNotificationClick.add(payload);
      },
    );

    // Permissions
    await _isAndroidPermissionGranted();
    await _requestPermissions();

    // Đăng ký handler nền cho FCM
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  }

  /// ---------------------------------------------------------
  /// 2. CHECK ANDROID PERMISSION
  /// ---------------------------------------------------------
  Future<void> _isAndroidPermissionGranted() async {
    if (!Platform.isAndroid) return;

    final isGranted = await flutterLocalNotificationsPlugin
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>()
            ?.areNotificationsEnabled() ??
        false;

    debugPrint("Android notification permission granted: $isGranted");
  }

  /// ---------------------------------------------------------
  /// 3. REQUEST PERMISSIONS (Android + iOS)
  /// ---------------------------------------------------------
  Future<void> _requestPermissions() async {
    // iOS
    if (Platform.isIOS) {
      final iosPlugin =
          flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();

      iosPlugin?.requestPermissions(alert: true, badge: true, sound: true);
    }

    // Android 13+
    if (Platform.isAndroid) {
      final androidPlugin =
          flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();

      final granted =
          await androidPlugin?.requestNotificationsPermission() ?? false;

      debugPrint("Android notification permission requested: $granted");
    }
  }

  /// ---------------------------------------------------------
  /// 4. SHOW SIMPLE NOTIFICATION
  /// ---------------------------------------------------------
  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'default_channel',
      'General Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    await flutterLocalNotificationsPlugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000, // unique id
      title,
      body,
      details,
      payload: payload,
    );
  }

  /// ---------------------------------------------------------
  /// 5. STREAM LISTENER WHEN NOTIFICATION PRESSED
  /// ---------------------------------------------------------
  void listenNotification(Function(String? payload) onClick) {
    onNotificationClick.stream.listen(onClick);
  }

  /// Yêu cầu quyền thông báo trước khi lấy FCM token
  Future<bool> _ensureNotificationPermission() async {
    // iOS & Android 13+ cần request permission
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    final granted =
        settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional;

    // Android 13+: optional extra check via local notification plugin
    if (Platform.isAndroid && !granted) {
      final androidPlugin =
          flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      final notifGranted =
          await androidPlugin?.requestNotificationsPermission() ?? false;
      return notifGranted;
    }

    return granted;
  }

  /// ---------------------------------------------------------
  /// 6. GET FCM TOKEN
  /// ---------------------------------------------------------
  Future<String?> getFcmToken() async {
    try {
      final hasPermission = await _ensureNotificationPermission();
      if (!hasPermission) {
        debugPrint("FCM permission not granted, skip getToken");
        return null;
      }

      final token = await FirebaseMessaging.instance.getToken();
      debugPrint("FCM Token: $token");
      return token;
    } catch (err) {
      debugPrint("Error getting FCM token: $err");
      return null;
    }
  }

  /// ---------------------------------------------------------
  /// 7. ATTACH FCM LISTENERS (foreground & opened)
  /// ---------------------------------------------------------
  Future<void> attachFirebaseListeners() async {
    // Hiển thị thông báo khi app đang foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      final title = notification?.title ?? 'Thông báo';
      final body = notification?.body ?? '';
      final payload = message.data.isNotEmpty ? message.data.toString() : null;

      showNotification(title: title, body: body, payload: payload);
    });

    // Khi người dùng tap vào thông báo để mở app
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      final payload = message.data.isNotEmpty ? message.data.toString() : null;
      onNotificationClick.add(payload);
    });

    // App khởi chạy từ trạng thái terminated qua notification
    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      final payload = initialMessage.data.isNotEmpty
          ? initialMessage.data.toString()
          : null;
      onNotificationClick.add(payload);
    }
  }
}
