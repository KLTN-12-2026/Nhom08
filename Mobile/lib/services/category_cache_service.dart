import 'dart:convert';

import 'package:hive_flutter/hive_flutter.dart';

import '../core/services/hive_service.dart';
import '../models/category.dart';

class CategoryCacheService {
  static const String _boxName = 'categories_cache';
  static const String _categoriesKey = 'categories';
  static const String _updatedAtKey = 'updated_at';

  Box<dynamic>? _box;

  Future<void> init() async {
    _box = await hiveService.openBox<dynamic>(_boxName);
  }

  Box<dynamic> get _ensureBox {
    final box = _box;
    if (box == null) {
      throw Exception(
          'CategoryCacheService chưa được khởi tạo. Gọi init() trước.');
    }
    return box;
  }

  Future<void> saveCategories(List<Category> categories) async {
    // try {
    //   final box = _ensureBox;
    //   final serialized = categories.map((c) => c.toJson()).toList();
    //   await box.put(_categoriesKey, jsonEncode(serialized));
    //   await box.put(_updatedAtKey, DateTime.now().toIso8601String());
    // } catch (e) {
    //   print('❌ CategoryCacheService: Lỗi khi lưu categories: $e');
    // }
  }

  List<Category> getCategories() {
    try {
      final box = _ensureBox;
      final raw = box.get(_categoriesKey) as String?;
      if (raw == null) return [];
      final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
      return decoded
          .map((item) =>
              Category.fromJson(Map<String, dynamic>.from(item as Map)))
          .toList();
    } catch (e) {
      print('❌ CategoryCacheService: Lỗi khi đọc categories: $e');
      return [];
    }
  }

  DateTime? get lastUpdatedAt {
    try {
      final box = _ensureBox;
      final raw = box.get(_updatedAtKey) as String?;
      return raw != null ? DateTime.tryParse(raw) : null;
    } catch (e) {
      print('❌ CategoryCacheService: Lỗi khi đọc thời gian cập nhật: $e');
      return null;
    }
  }

  Future<void> clear() async {
    try {
      final box = _ensureBox;
      await box.delete(_categoriesKey);
      await box.delete(_updatedAtKey);
    } catch (e) {
      print('❌ CategoryCacheService: Lỗi khi xoá cache: $e');
    }
  }
}

final categoryCacheService = CategoryCacheService();
