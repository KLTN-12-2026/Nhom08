import 'package:hive_flutter/hive_flutter.dart';
import '../models/spin_history.dart';
import '../models/place.dart';
import '../core/services/hive_service.dart';

class SpinHistoryService {
  static const String _boxName = 'spin_history';
  Box<SpinHistory>? _box;

  Future<void> init() async {
    _box = await hiveService.openBox<SpinHistory>(_boxName);
  }

  Box<SpinHistory> get box {
    if (_box == null) {
      throw Exception(
          'SpinHistoryService chưa được khởi tạo. Gọi init() trước.');
    }
    return _box!;
  }

  Future<void> addSpinHistory(Place place) async {
    try {
      final history = SpinHistory.fromPlace(place);
      await box.add(history);
      print('✅ SpinHistoryService: Đã lưu lịch sử quay: ${place.name}');
    } catch (e) {
      print('❌ SpinHistoryService: Lỗi khi lưu lịch sử: $e');
    }
  }

  List<SpinHistory> getSpinHistory() {
    try {
      return box.values.toList().reversed.toList(); // Mới nhất trước
    } catch (e) {
      print('❌ SpinHistoryService: Lỗi khi đọc lịch sử: $e');
      return [];
    }
  }

  Future<void> clearHistory() async {
    try {
      await box.clear();
      print('✅ SpinHistoryService: Đã xóa toàn bộ lịch sử');
    } catch (e) {
      print('❌ SpinHistoryService: Lỗi khi xóa lịch sử: $e');
    }
  }

  Future<void> deleteHistory(String id) async {
    try {
      final index = box.values.toList().indexWhere((h) => h.placeId == id);
      if (index != -1) {
        await box.deleteAt(index);
        print('✅ SpinHistoryService: Đã xóa lịch sử: $id');
      }
    } catch (e) {
      print('❌ SpinHistoryService: Lỗi khi xóa lịch sử: $e');
    }
  }
}
