import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:trove/data/response/app_info/app_info_response.dart';

/// DataAppService - Lưu trữ các thông tin data của app (metrics, counts, etc.)
/// Singleton pattern với reactive updates
class DataAppService {
  // Singleton
  static final DataAppService _instance = DataAppService._internal();
  factory DataAppService() => _instance;
  DataAppService._internal();

  // Public getter
  static DataAppService get instance => _instance;

  // Metrics model với reactive stream
  final BehaviorSubject<AppMetrics> _metricsSubject =
      BehaviorSubject<AppMetrics>.seeded(AppMetrics());

  // App info (thông tin cấu hình server/app)
  final BehaviorSubject<AppInfoResponse?> _appInfoSubject =
      BehaviorSubject<AppInfoResponse?>.seeded(null);

  // Stream getter
  Stream<AppMetrics> get metricsStream => _metricsSubject.stream;
  AppMetrics get metrics => _metricsSubject.value;

  // Reactive getter (compatible with Obx pattern)
  ValueNotifier<AppMetrics> get rxMetrics => ValueNotifier<AppMetrics>(metrics);

  // App info getters
  Stream<AppInfoResponse?> get appInfoStream => _appInfoSubject.stream;
  AppInfoResponse? get appInfo => _appInfoSubject.valueOrNull;

  /// Cập nhật app-info từ API `/api/app-info`
  void updateAppInfo(AppInfoResponse info) {
    _appInfoSubject.add(info);
    debugPrint("🧩 DataAppService: AppInfo updated - ${info.toJson()}");
  }

  /// Update metrics
  void updateMetrics(AppMetrics newMetrics) {
    _metricsSubject.add(newMetrics);
    rxMetrics.value = newMetrics;
    debugPrint(
        "📊 DataAppService: Metrics updated - claimingTotal: ${newMetrics.claimingTotal}");
  }

  /// Update claiming total
  void updateClaimingTotal(int count) {
    final updatedMetrics = metrics.copyWith(claimingTotal: count);
    updateMetrics(updatedMetrics);
  }

  /// Increment claiming total
  void incrementClaimingTotal([int by = 1]) {
    updateClaimingTotal(metrics.claimingTotal + by);
  }

  /// Decrement claiming total
  void decrementClaimingTotal([int by = 1]) {
    final newCount =
        (metrics.claimingTotal - by).clamp(0, double.infinity).toInt();
    updateClaimingTotal(newCount);
  }

  /// Update notification count
  void updateNotificationCount(int count) {
    final updatedMetrics = metrics.copyWith(notificationCount: count);
    updateMetrics(updatedMetrics);
  }

  /// Increment notification count
  void incrementNotificationCount([int by = 1]) {
    updateNotificationCount(metrics.notificationCount + by);
  }

  /// Decrement notification count
  void decrementNotificationCount([int by = 1]) {
    final newCount =
        (metrics.notificationCount - by).clamp(0, double.infinity).toInt();
    updateNotificationCount(newCount);
  }

  /// Clear all metrics
  void clearMetrics() {
    updateMetrics(AppMetrics());
    _appInfoSubject.add(null);
  }

  /// Dispose
  void dispose() {
    _metricsSubject.close();
    _appInfoSubject.close();
  }
}

/// AppMetrics - Model chứa các metrics của app
class AppMetrics {
  final int claimingTotal;
  final int notificationCount;
  final Map<String, dynamic> customData;

  const AppMetrics({
    this.claimingTotal = 0,
    this.notificationCount = 0,
    this.customData = const {},
  });

  AppMetrics copyWith({
    int? claimingTotal,
    int? notificationCount,
    Map<String, dynamic>? customData,
  }) {
    return AppMetrics(
      claimingTotal: claimingTotal ?? this.claimingTotal,
      notificationCount: notificationCount ?? this.notificationCount,
      customData: customData ?? this.customData,
    );
  }

  @override
  String toString() {
    return 'AppMetrics(claimingTotal: $claimingTotal, notificationCount: $notificationCount)';
  }
}







