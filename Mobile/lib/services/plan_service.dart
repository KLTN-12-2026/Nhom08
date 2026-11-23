import 'package:dio/dio.dart';

import '../data/data_sources/remote/api_client.dart';
import '../data/request/plan/create_plan_request.dart';
import '../data/response/plan/create_plan_response.dart';
import '../models/plan.dart';

class PlanService {
  final ApiClient _apiClient;

  PlanService(this._apiClient);

  /// Generate a new plan
  Future<CreatePlanResponse> createPlan(CreatePlanRequest request) async {
    try {
      print("🔍 PlanService: Gọi API createPlan...");
      print("🔍 PlanService: Budget: ${request.budget}");
      print("🔍 PlanService: Activity Groups: ${request.activityGroups}");
      print("🔍 PlanService: Save Plan: ${request.savePlan}");
      print("🔍 PlanService: Payload: ${request.toJson()}");

      final response = await _apiClient.appService.createPlan(request);

      print("✅ PlanService: Plan created successfully");
      print("🔍 PlanService: Response: ${response.message}");

      return response;
    } on DioException catch (e) {
      // Handle plan limit reached (HTTP 403 with specific error_code)
      if (e.response?.statusCode == 403) {
        final data = e.response?.data;
        final errorCode =
            data is Map<String, dynamic> ? data['error_code'] : null;
        if (errorCode == 'PLAN_LIMIT_REACHED') {
          final limitData = data['data'] as Map<String, dynamic>? ?? {};
          final limit = limitData['limit'] ?? 5;
          final currentCount = limitData['current_count'] ?? limit;
          throw Exception(
            'Bạn đã đạt giới hạn số plan ($currentCount/$limit). '
            'Vui lòng nâng cấp gói hoặc xoá bớt plan cũ.',
          );
        }
      }
      print("❌ PlanService createPlan Dio error: $e");
      throw Exception('Failed to create plan: ${e.message}');
    } catch (e) {
      print("❌ PlanService createPlan error: $e");
      throw Exception('Failed to create plan: $e');
    }
  }

  static final List<Plan> _localSavedPlans = [];

  void saveLocalPlan(Plan plan) {
    if (!_localSavedPlans.any((p) => p.id == plan.id)) {
      _localSavedPlans.insert(0, plan);
    }
  }

  /// Get saved plans with pagination
  Future<List<Plan>> getSavedPlans({
    int page = 1,
  }) async {
    try {
      print("🔍 PlanService: Gọi API getSavedPlans...");
      print("🔍 PlanService: page=$page");

      List<Plan> plans = [];
      try {
        final response = await _apiClient.appService.getSavedPlans(
          page: page,
        );
        plans = response.data;
      } catch (e) {
        print("❌ PlanService getSavedPlans api fetch error: $e");
      }

      // Merge local saved plans (only unique ones)
      final mergedPlans = <Plan>[..._localSavedPlans];
      for (var plan in plans) {
        if (!mergedPlans.any((p) => p.id == plan.id)) {
          mergedPlans.add(plan);
        }
      }

      return mergedPlans;
    } catch (e) {
      print("❌ PlanService getSavedPlans error: $e");
      return _localSavedPlans;
    }
  }

  /// Save a plan
  Future<Plan?> savePlan(int planId) async {
    try {
      print("🔍 PlanService: Gọi API savePlan với ID: $planId");

      final response = await _apiClient.appService.savePlan(planId);

      print("✅ PlanService: Plan saved successfully");
      print("🔍 PlanService: Response: ${response.message}");

      if (response.data != null) {
        saveLocalPlan(response.data!);
      }

      return response.data;
    } catch (e) {
      print("❌ PlanService savePlan error: $e");
      throw Exception('Failed to save plan: $e');
    }
  }

  /// Delete a plan
  Future<void> deletePlan(int planId) async {
    _localSavedPlans.removeWhere((p) => p.id == planId);
    try {
      print("🔍 PlanService: Gọi API deletePlan với ID: $planId");

      await _apiClient.appService.deletePlan(planId);

      print("✅ PlanService: Plan deleted successfully");
    } on DioException catch (e) {
      if (e.response?.statusCode == 403) {
        final data = e.response?.data;
        final message = data is Map<String, dynamic>
            ? (data['message'] ?? 'Bạn không có quyền xoá kế hoạch này')
            : 'Bạn không có quyền xoá kế hoạch này';
        throw Exception(message);
      }
      print("❌ PlanService deletePlan Dio error: $e");
      throw Exception('Failed to delete plan: ${e.message}');
    } catch (e) {
      print("❌ PlanService deletePlan error: $e");
      throw Exception('Failed to delete plan: $e');
    }
  }

  /// Get plan detail
  Future<Plan?> getPlanDetail(int planId) async {
    final isLocalPlan = planId > 1000000000000;
    if (isLocalPlan) {
      try {
        final localPlan = _localSavedPlans.firstWhere((p) => p.id == planId);
        return localPlan;
      } catch (localErr) {
        throw Exception('Không tìm thấy chi tiết kế hoạch cục bộ: $localErr');
      }
    }

    try {
      print("🔍 PlanService: Gọi API getPlanDetail với ID: $planId");

      final response = await _apiClient.appService.getPlanDetail(planId);

      print("✅ PlanService: Plan detail retrieved successfully");
      return response.data;
    } catch (e) {
      print("❌ PlanService getPlanDetail error: $e. Fallback to local cache.");
      try {
        final localPlan = _localSavedPlans.firstWhere((p) => p.id == planId);
        return localPlan;
      } catch (_) {
        throw Exception('Failed to get plan detail: $e');
      }
    }
  }
}
