import 'package:hive_flutter/hive_flutter.dart';

/// Generic Hive service để quản lý tất cả các box trong ứng dụng
class HiveService {
  static final HiveService _instance = HiveService._internal();
  factory HiveService() => _instance;
  HiveService._internal();

  final Map<String, Box> _boxes = {};

  /// Initialize Hive và đăng ký adapters
  Future<void> init() async {
    await Hive.initFlutter();
    // Adapters sẽ được đăng ký trong main.dart
  }

  /// Mở hoặc lấy box đã mở
  Future<Box<T>> openBox<T>(String boxName) async {
    if (_boxes.containsKey(boxName)) {
      return _boxes[boxName] as Box<T>;
    }
    final box = await Hive.openBox<T>(boxName);
    _boxes[boxName] = box;
    return box;
  }

  /// Lấy box đã mở (nếu chưa mở sẽ throw error)
  Box<T>? getBox<T>(String boxName) {
    return _boxes[boxName] as Box<T>?;
  }

  /// Đóng box
  Future<void> closeBox(String boxName) async {
    if (_boxes.containsKey(boxName)) {
      await _boxes[boxName]!.close();
      _boxes.remove(boxName);
    }
  }

  /// Đóng tất cả boxes
  Future<void> closeAll() async {
    for (final box in _boxes.values) {
      await box.close();
    }
    _boxes.clear();
  }

  /// Xóa box (xóa cả dữ liệu)
  Future<void> deleteBox(String boxName) async {
    await closeBox(boxName);
    await Hive.deleteBoxFromDisk(boxName);
  }
}

// ✅ Global instance
final hiveService = HiveService();
