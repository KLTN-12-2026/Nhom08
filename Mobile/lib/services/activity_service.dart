// lib/services/category_service.dart
import 'package:trove/data/request/category.dart';

import '../data/data_sources/remote/api_client.dart';
import '../models/category.dart';
import 'category_cache_service.dart';
import '../data/response/plan/activity_groups_response.dart';

class CategoryService {
  final ApiClient _apiClient;
  // ✅ Không dùng cache service nữa, nhưng giữ lại để không break constructor
  // ignore: unused_field
  final CategoryCacheService? _cacheService;

  // ✅ Dùng để tránh duplicate requests khi nhiều nơi gọi cùng lúc
  Future<List<Category>>? _ongoingFetch;
  Future<List<ActivityGroup>>? _ongoingActivityGroupFetch;
  List<ActivityGroup>? _cachedActivityGroups;

  CategoryService({
    required ApiClient apiClient,
    CategoryCacheService? cacheService,
  })  : _apiClient = apiClient,
        _cacheService = cacheService;

  // ✅ Get all categories - Luôn fetch từ API, không dùng cache
  Future<List<Category>> getCategories({bool forceRefresh = false}) async {
    // ✅ Bỏ qua cache, luôn fetch từ API
    // Nếu đang có request đang chạy, đợi request đó
    if (_ongoingFetch != null) {
      return _ongoingFetch!;
    }

    _ongoingFetch = _fetchCategories();
    try {
      final result = await _ongoingFetch!;
      return result;
    } finally {
      _ongoingFetch = null;
    }
  }

  Future<List<Category>> _fetchCategories() async {
    try {
      print("🔍 CategoryService: Gọi API getCategories...");

      final response = await _apiClient.appService.getCategories();

      if (response.success == true && response.data != null) {
        final categories = response.data!
            .map((m) => Category(
                  id: m.id ?? 0,
                  name: m.name ?? '',
                  displayName: m.displayName ?? '',
                  description: m.description,
                  isActive: m.isActive ?? true,
                  createdAt: m.createdAt != null
                      ? DateTime.tryParse(m.createdAt!)
                      : null,
                  updatedAt: m.updatedAt != null
                      ? DateTime.tryParse(m.updatedAt!)
                      : null,
                ))
            .toList();

        print("✅ CategoryService: ${categories.length} categories từ API");
        return categories;
      } else {
        print("❌ CategoryService: Get categories thất bại");
        throw Exception(response.message ?? 'Failed to get categories');
      }
    } catch (e) {
      print('❌ CategoryService: Get categories error: $e');
      rethrow;
    }
  }

  Future<List<Category>> refreshCategories() async {
    return _fetchCategories();
  }

  Future<List<ActivityGroup>> getActivityGroups(
      {bool forceRefresh = false}) async {
    // Trả về cache nếu có và không force refresh
    if (!forceRefresh && _cachedActivityGroups != null) {
      return _cachedActivityGroups!;
    }

    // Nếu đang có request đang chạy, đợi request đó
    if (_ongoingActivityGroupFetch != null) {
      return _ongoingActivityGroupFetch!;
    }

    _ongoingActivityGroupFetch = _fetchActivityGroups();
    try {
      final result = await _ongoingActivityGroupFetch!;
      _cachedActivityGroups = result;
      return result;
    } finally {
      _ongoingActivityGroupFetch = null;
    }
  }

  Future<List<ActivityGroup>> _fetchActivityGroups() async {
    try {
      final response = await _apiClient.appService.getActivityGroups();
      return response.groups;
    } catch (e) {
      print('❌ CategoryService.getActivityGroups: Error=$e');
      throw Exception('Failed to get activity groups: $e');
    }
  }

  // ✅ Không dùng cache nữa, luôn trả về empty list
  // Nếu cần categories, gọi getCategories() để fetch từ API
  List<Category> getCachedCategories() {
    return const [];
  }

  // ✅ Create category
  Future<void> createCategory({
    required String name,
    required String displayName,
    String? description,
    required bool isActive,
  }) async {
    try {
      print("🔍 CategoryService: Gọi API createCategory...");
      print("🔍 CategoryService: name=$name, displayName=$displayName");

      final request = CreateCategoryRequest(
        name: name,
        displayName: displayName,
        description: description,
        isActive: isActive,
      );

      await _apiClient.appService.createCategory(request);

      print("✅ CategoryService: Create category thành công");

      // Refresh cache to include the newly created category
      await refreshCategories();
    } catch (e) {
      print("❌ CategoryService createCategory error: $e");
      throw Exception('Failed to create category: $e');
    }
  }
}
