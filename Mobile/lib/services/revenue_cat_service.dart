import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

/// RevenueCat Service để quản lý In-App Purchases
///
/// Features:
/// - Initialize RevenueCat với API keys từ .env
/// - Check premium status
/// - Purchase packages
/// - Restore purchases
/// - Listen to purchaser updates
class RevenueCatService {
  RevenueCatService._privateConstructor();
  static final RevenueCatService instance =
      RevenueCatService._privateConstructor();

  // Stream controller để broadcast purchaser info updates
  final _purchaserInfoController = StreamController<CustomerInfo>.broadcast();

  /// Stream để listen purchaser info changes
  Stream<CustomerInfo> get purchaserInfoStream =>
      _purchaserInfoController.stream;

  // Current customer info
  CustomerInfo? _currentCustomerInfo;
  CustomerInfo? get currentCustomerInfo => _currentCustomerInfo;

  // Entitlement identifier cho premium access
  static const String _premiumEntitlementId = 'premium';

  /// Initialize RevenueCat
  ///
  /// Phải gọi method này trong main.dart trước khi runApp()
  Future<void> initialize() async {
    try {
      // Load API keys từ .env
      final apiKey = Platform.isIOS
          ? dotenv.env['REVENUECAT_IOS_API_KEY']
          : dotenv.env['REVENUECAT_ANDROID_API_KEY'];

      if (apiKey == null || apiKey.isEmpty) {
        debugPrint('❌ RevenueCat API key not found in .env file');
        return;
      }

      // Configure RevenueCat
      final configuration = PurchasesConfiguration(apiKey);

      // Initialize
      await Purchases.configure(configuration);

      // Enable debug logs trong development
      if (kDebugMode) {
        Purchases.setLogLevel(LogLevel.debug);
      }

      debugPrint('✅ RevenueCat initialized successfully');

      // Setup listener cho purchaser updates
      Purchases.addCustomerInfoUpdateListener(_onCustomerInfoUpdate);

      // Get initial customer info
      await refreshCustomerInfo();
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to initialize RevenueCat: ${e.message}');
    } catch (e) {
      debugPrint('❌ Unexpected error initializing RevenueCat: $e');
    }
  }

  /// Callback khi customer info được update
  void _onCustomerInfoUpdate(CustomerInfo customerInfo) {
    _currentCustomerInfo = customerInfo;
    _purchaserInfoController.add(customerInfo);
    debugPrint('📦 Customer info updated: ${customerInfo.entitlements.all}');
  }

  /// Refresh customer info
  Future<CustomerInfo?> refreshCustomerInfo() async {
    try {
      final customerInfo = await Purchases.getCustomerInfo();
      _currentCustomerInfo = customerInfo;
      return customerInfo;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to refresh customer info: ${e.message}');
      return null;
    }
  }

  /// Check xem user có premium hay không
  Future<bool> isPremium() async {
    try {
      final customerInfo = await Purchases.getCustomerInfo();
      final entitlement = customerInfo.entitlements.all[_premiumEntitlementId];
      return entitlement?.isActive ?? false;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to check premium status: ${e.message}');
      return false;
    }
  }

  /// Get current offerings (packages available for purchase)
  Future<Offerings?> getOfferings() async {
    try {
      final offerings = await Purchases.getOfferings();

      if (offerings.current == null) {
        debugPrint('⚠️ No current offering found');
        return null;
      }

      debugPrint(
          '📦 Available offerings: ${offerings.current?.availablePackages.length}');
      return offerings;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to get offerings: ${e.message}');
      return null;
    }
  }

  /// Purchase a package
  ///
  /// Returns:
  /// - CustomerInfo nếu thành công
  /// - null nếu user cancel
  /// - throws Exception nếu có lỗi khác
  Future<CustomerInfo?> purchasePackage(Package package) async {
    try {
      debugPrint('🛒 Attempting to purchase: ${package.identifier}');

      final purchaserInfo = await Purchases.purchasePackage(package);

      debugPrint(
          '✅ Purchase successful: ${purchaserInfo.customerInfo.entitlements.all}');
      return purchaserInfo.customerInfo;
    } on PlatformException catch (e) {
      final errorCode = PurchasesErrorHelper.getErrorCode(e);

      if (errorCode == PurchasesErrorCode.purchaseCancelledError) {
        debugPrint('🚫 User cancelled purchase');
        return null; // Don't throw error for cancellation
      } else if (errorCode == PurchasesErrorCode.paymentPendingError) {
        debugPrint('⏳ Payment pending');
        throw Exception(
            'Thanh toán đang chờ xử lý. Vui lòng đợi trong giây lát.');
      } else if (errorCode == PurchasesErrorCode.productAlreadyPurchasedError) {
        debugPrint('✅ Product already purchased');
        throw Exception(
            'Bạn đã sở hữu gói này. Vui lòng thử "Khôi phục giao dịch".');
      } else if (errorCode == PurchasesErrorCode.storeProblemError) {
        debugPrint('❌ Store problem: ${e.message}');
        throw Exception('Lỗi kết nối App Store. Vui lòng thử lại sau.');
      } else if (errorCode == PurchasesErrorCode.networkError) {
        debugPrint('❌ Network error: ${e.message}');
        throw Exception('Lỗi kết nối mạng. Vui lòng kiểm tra internet.');
      } else if (errorCode == PurchasesErrorCode.purchaseNotAllowedError) {
        debugPrint('❌ Purchase not allowed: ${e.message}');
        throw Exception(
            'Thiết bị không cho phép mua hàng. Vui lòng kiểm tra cài đặt.');
      } else if (errorCode == PurchasesErrorCode.purchaseInvalidError) {
        debugPrint('❌ Purchase invalid: ${e.message}');
        throw Exception('Giao dịch không hợp lệ. Vui lòng thử lại.');
      } else {
        debugPrint('❌ Purchase failed: ${e.message}');
        throw Exception('Thanh toán thất bại. Vui lòng thử lại sau.');
      }
    } catch (e) {
      // If it's an Exception we already handled, rethrow it
      rethrow;
    }
  }

  /// Restore purchases
  ///
  /// Hữu ích khi:
  /// - User reinstall app
  /// - User đăng nhập từ device mới
  /// - User claim they purchased but app doesn't recognize
  Future<CustomerInfo?> restorePurchases() async {
    try {
      debugPrint('🔄 Restoring purchases...');

      final customerInfo = await Purchases.restorePurchases();

      debugPrint('✅ Purchases restored: ${customerInfo.entitlements.all}');
      return customerInfo;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to restore purchases: ${e.message}');
      return null;
    }
  }

  /// Set user ID (optional)
  ///
  /// Dùng để track user across devices
  /// Nên gọi sau khi user login
  Future<void> setUserId(String userId) async {
    try {
      await Purchases.logIn(userId);
      debugPrint('✅ User ID set: $userId');
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to set user ID: ${e.message}');
    }
  }

  /// Logout user
  ///
  /// Gọi khi user logout khỏi app
  Future<void> logout() async {
    try {
      await Purchases.logOut();
      debugPrint('✅ User logged out from RevenueCat');
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to logout: ${e.message}');
    }
  }

  /// Get active subscriptions
  Future<List<String>> getActiveSubscriptions() async {
    try {
      final customerInfo = await Purchases.getCustomerInfo();

      final activeSubscriptions = customerInfo.entitlements.active.entries
          .map((entry) => entry.key)
          .toList();

      debugPrint('📋 Active subscriptions: $activeSubscriptions');
      return activeSubscriptions;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to get active subscriptions: ${e.message}');
      return [];
    }
  }

  /// Check xem có free trial không
  Future<bool> hasFreeTrial() async {
    try {
      final offerings = await getOfferings();

      if (offerings?.current == null) return false;

      // Check nếu bất kỳ package nào có intro price
      for (final package in offerings!.current!.availablePackages) {
        if (package.storeProduct.introductoryPrice != null) {
          return true;
        }
      }

      return false;
    } catch (e) {
      debugPrint('❌ Failed to check free trial: $e');
      return false;
    }
  }

  /// Get subscription expiration date
  Future<DateTime?> getSubscriptionExpirationDate() async {
    try {
      final customerInfo = await Purchases.getCustomerInfo();
      final entitlement = customerInfo.entitlements.all[_premiumEntitlementId];

      if (entitlement != null && entitlement.isActive) {
        return entitlement.expirationDate != null
            ? DateTime.parse(entitlement.expirationDate!)
            : null;
      }

      return null;
    } on PlatformException catch (e) {
      debugPrint('❌ Failed to get expiration date: ${e.message}');
      return null;
    }
  }

  /// Enable debug logs
  void setDebugLogsEnabled(bool enabled) {
    Purchases.setLogLevel(enabled ? LogLevel.debug : LogLevel.info);
  }

  /// Dispose
  void dispose() {
    _purchaserInfoController.close();
  }
}
